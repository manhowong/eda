import { WorkspaceFile, ProfileConfig, ProjectConfig, SettingsConfigFile } from '../types';
import {
  DEFAULT_INSTRUCTIONS,
  STARTER_TEMPLATES,
  STARTER_SIGNATURES,
  getDefaultTemplates,
  getDefaultSignatures,
} from './defaultWorkspaceData';

export {
  DEFAULT_INSTRUCTIONS,
  STARTER_TEMPLATES,
  STARTER_SIGNATURES,
  getDefaultTemplates,
  getDefaultSignatures,
};

// Check browser support for File System Access API
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// Active settings directory handle kept in memory for the active session
let activeSettingsHandle: FileSystemDirectoryHandle | null = null;

export function getActiveSettingsHandle(): FileSystemDirectoryHandle | null {
  return activeSettingsHandle;
}

export function setActiveSettingsHandle(handle: FileSystemDirectoryHandle | null): void {
  activeSettingsHandle = handle;
}

export class DirectoryPickerError extends Error {
  code: 'NOT_SUPPORTED' | 'USER_CANCELLED' | 'UNKNOWN';
  constructor(message: string, code: 'NOT_SUPPORTED' | 'USER_CANCELLED' | 'UNKNOWN') {
    super(message);
    this.name = 'DirectoryPickerError';
    this.code = code;
  }
}

// Parse key, provider, and model from .env text
export function parseEnvFile(envContent: string): {
  apiKey: string;
  apiKeyProvider: 'gemini' | 'openai' | 'openrouter' | 'custom' | null;
  modelName: string;
} {
  const lines = envContent.split('\n');
  let geminiKey = '';
  let openaiKey = '';
  let openrouterKey = '';
  let llmKey = '';
  let geminiModel = '';
  let openaiModel = '';
  let openrouterModel = '';
  let genericModel = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).trim();
      }
      if (key === 'GEMINI_API_KEY') geminiKey = val;
      else if (key === 'OPENROUTER_API_KEY') openrouterKey = val;
      else if (key === 'OPENAI_API_KEY') openaiKey = val;
      else if (key === 'LLM_API_KEY') llmKey = val;
      else if (key === 'GEMINI_MODEL') geminiModel = val;
      else if (key === 'OPENAI_MODEL') openaiModel = val;
      else if (key === 'OPENROUTER_MODEL') openrouterModel = val;
      else if (key === 'LLM_MODEL' || key === 'MODEL_NAME' || key === 'MODEL') genericModel = val;
    }
  }

  if (openrouterKey) {
    return { apiKey: openrouterKey, apiKeyProvider: 'openrouter', modelName: openrouterModel || genericModel };
  }
  if (openaiKey) {
    return { apiKey: openaiKey, apiKeyProvider: 'openai', modelName: openaiModel || genericModel };
  }
  if (geminiKey) {
    return { apiKey: geminiKey, apiKeyProvider: 'gemini', modelName: geminiModel || genericModel };
  }
  if (llmKey) {
    if (llmKey.startsWith('sk-or-')) {
      return { apiKey: llmKey, apiKeyProvider: 'openrouter', modelName: openrouterModel || genericModel };
    }
    const provider = llmKey.startsWith('sk-') ? 'openai' : 'gemini';
    const model = provider === 'openai' ? (openaiModel || genericModel) : (geminiModel || genericModel);
    return { apiKey: llmKey, apiKeyProvider: provider, modelName: model };
  }
  return { apiKey: '', apiKeyProvider: null, modelName: genericModel };
}

// Generate .env file content
export function formatEnvFile(
  apiKey: string,
  provider: 'gemini' | 'openai' | 'openrouter',
  modelName: string
): string {
  let content = '# Profile Environment Configuration\n';
  const cleanKey = apiKey.trim();
  const cleanModel = modelName.trim();

  if (provider === 'gemini') {
    content += `GEMINI_API_KEY="${cleanKey}"\n`;
    if (cleanModel) content += `GEMINI_MODEL="${cleanModel}"\n`;
  } else if (provider === 'openrouter') {
    content += `OPENROUTER_API_KEY="${cleanKey}"\n`;
    if (cleanModel) content += `OPENROUTER_MODEL="${cleanModel}"\n`;
  } else {
    content += `OPENAI_API_KEY="${cleanKey}"\n`;
    if (cleanModel) content += `OPENAI_MODEL="${cleanModel}"\n`;
  }

  return content;
}

/**
 * Pick location for the "assistant-settings" folder.
 * If user selected an existing "assistant-settings" directory, use it directly.
 * Otherwise, creates an "assistant-settings" subfolder inside the selected directory.
 */
export async function pickAndInitializeSettingsFolder(): Promise<{
  settingsHandle: FileSystemDirectoryHandle;
  displayName: string;
}> {
  if (!isFileSystemAccessSupported()) {
    throw new DirectoryPickerError(
      'The File System Access API is not supported in this browser.',
      'NOT_SUPPORTED'
    );
  }

  try {
    const pickedHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });

    let settingsHandle: FileSystemDirectoryHandle;

    if (pickedHandle.name === 'assistant-settings') {
      settingsHandle = pickedHandle;
    } else {
      settingsHandle = await pickedHandle.getDirectoryHandle('assistant-settings', { create: true });
    }

    // Ensure profiles/ and projects/ subfolders exist
    const profilesDir = await settingsHandle.getDirectoryHandle('profiles', { create: true });
    const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });

    // Check if profiles are empty; if so, create an empty profile (no credentials)
    let hasProfiles = false;
    for await (const [, entry] of profilesDir.entries()) {
      if (entry.kind === 'directory') {
        hasProfiles = true;
        break;
      }
    }
    if (!hasProfiles) {
      const defaultProfileDir = await profilesDir.getDirectoryHandle('default', { create: true });
      const envHandle = await defaultProfileDir.getFileHandle('.env', { create: true });
      const w = await envHandle.createWritable();
      await w.write('OPENAI_API_KEY=""\n');
      await w.close();
    }

    // Check if projects are empty; if so, create sample-project with default values
    let hasProjects = false;
    for await (const [, entry] of projectsDir.entries()) {
      if (entry.kind === 'directory') {
        hasProjects = true;
        break;
      }
    }
    if (!hasProjects) {
      const sampleProjDir = await projectsDir.getDirectoryHandle('sample-project', { create: true });
      const instHandle = await sampleProjDir.getFileHandle('instructions.md', { create: true });
      const wInst = await instHandle.createWritable();
      await wInst.write(DEFAULT_INSTRUCTIONS);
      await wInst.close();

      const templatesDir = await sampleProjDir.getDirectoryHandle('templates', { create: true });
      for (const [filename, content] of Object.entries(STARTER_TEMPLATES)) {
        const th = await templatesDir.getFileHandle(filename, { create: true });
        const tw = await th.createWritable();
        await tw.write(content);
        await tw.close();
      }

      const signaturesDir = await sampleProjDir.getDirectoryHandle('signatures', { create: true });
      for (const [filename, content] of Object.entries(STARTER_SIGNATURES)) {
        const sh = await signaturesDir.getFileHandle(filename, { create: true });
        const sw = await sh.createWritable();
        await sw.write(content);
        await sw.close();
      }
    }

    // Ensure settings.json exists and has active profile and project set
    const currentConfig = await readSettingsConfig(settingsHandle);
    let updatedConfig = false;
    if (!currentConfig.activeProfile) {
      currentConfig.activeProfile = 'default';
      updatedConfig = true;
    }
    if (!currentConfig.activeProject) {
      currentConfig.activeProject = 'sample-project';
      updatedConfig = true;
    }
    if (updatedConfig) {
      await writeSettingsConfig(settingsHandle, currentConfig);
    }

    activeSettingsHandle = settingsHandle;
    return {
      settingsHandle,
      displayName: settingsHandle.name,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new DirectoryPickerError('Folder selection was cancelled.', 'USER_CANCELLED');
    }
    throw err;
  }
}

/**
 * Read settings.json from assistant-settings folder
 */
export async function readSettingsConfig(
  settingsHandle: FileSystemDirectoryHandle
): Promise<SettingsConfigFile> {
  try {
    const fileHandle = await settingsHandle.getFileHandle('settings.json');
    const file = await fileHandle.getFile();
    const text = await file.text();
    const parsed = JSON.parse(text);
    return {
      activeProfile: typeof parsed.activeProfile === 'string' ? parsed.activeProfile : '',
      activeProject: typeof parsed.activeProject === 'string' ? parsed.activeProject : '',
    };
  } catch {
    // If not found or invalid, create default settings.json
    const defaultConfig: SettingsConfigFile = {
      activeProfile: '',
      activeProject: '',
    };
    await writeSettingsConfig(settingsHandle, defaultConfig);
    return defaultConfig;
  }
}

/**
 * Write settings.json to assistant-settings folder
 */
export async function writeSettingsConfig(
  settingsHandle: FileSystemDirectoryHandle,
  config: SettingsConfigFile
): Promise<void> {
  const fileHandle = await settingsHandle.getFileHandle('settings.json', { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(config, null, 2));
  await writable.close();
}

/**
 * List all profiles from /profiles directory
 */
export async function listProfiles(
  settingsHandle: FileSystemDirectoryHandle
): Promise<ProfileConfig[]> {
  const profilesDir = await settingsHandle.getDirectoryHandle('profiles', { create: true });
  const profiles: ProfileConfig[] = [];

  for await (const [name, entry] of profilesDir.entries()) {
    if (entry.kind === 'directory') {
      const profileDir = entry as FileSystemDirectoryHandle;
      let envText = '';
      try {
        const envHandle = await profileDir.getFileHandle('.env');
        const envFile = await envHandle.getFile();
        envText = await envFile.text();
      } catch {
        // .env may not exist yet
      }

      const { apiKey, apiKeyProvider, modelName } = parseEnvFile(envText);
      profiles.push({
        name,
        apiKey,
        apiKeyProvider,
        modelName,
      });
    }
  }

  return profiles.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Save / Update a profile (creates or renames folder, writes .env)
 */
export async function saveProfileToDisk(
  settingsHandle: FileSystemDirectoryHandle,
  oldName: string | null,
  newName: string,
  config: {
    apiKey: string;
    apiKeyProvider: 'gemini' | 'openai' | 'openrouter';
    modelName: string;
  }
): Promise<void> {
  const profilesDir = await settingsHandle.getDirectoryHandle('profiles', { create: true });
  const cleanName = newName.trim();
  if (!cleanName) throw new Error('Profile name cannot be empty.');

  // If renaming, handle old folder
  if (oldName && oldName !== cleanName) {
    try {
      await profilesDir.removeEntry(oldName, { recursive: true });
    } catch {
      // ignore if old directory didn't exist
    }
  }

  const profileDir = await profilesDir.getDirectoryHandle(cleanName, { create: true });
  const envContent = formatEnvFile(config.apiKey, config.apiKeyProvider, config.modelName);

  const envFileHandle = await profileDir.getFileHandle('.env', { create: true });
  const writable = await envFileHandle.createWritable();
  await writable.write(envContent);
  await writable.close();
}

/**
 * Delete a profile directory
 */
export async function deleteProfileFromDisk(
  settingsHandle: FileSystemDirectoryHandle,
  profileName: string
): Promise<void> {
  const profilesDir = await settingsHandle.getDirectoryHandle('profiles', { create: true });
  await profilesDir.removeEntry(profileName, { recursive: true });
}

/**
 * List all projects from /projects directory
 */
export async function listProjects(
  settingsHandle: FileSystemDirectoryHandle
): Promise<ProjectConfig[]> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  const projects: ProjectConfig[] = [];

  for await (const [name, entry] of projectsDir.entries()) {
    if (entry.kind === 'directory') {
      const projectDir = entry as FileSystemDirectoryHandle;
      let instructions = DEFAULT_INSTRUCTIONS;
      const templates: WorkspaceFile[] = [];
      const signatures: WorkspaceFile[] = [];

      // Read instructions.md
      try {
        const instHandle = await projectDir.getFileHandle('instructions.md');
        const instFile = await instHandle.getFile();
        instructions = await instFile.text();
      } catch {
        // Use default
      }

      // Read templates/
      try {
        const templatesDir = await projectDir.getDirectoryHandle('templates');
        for await (const [fileName, fileEntry] of templatesDir.entries()) {
          if (fileEntry.kind === 'file' && fileName.endsWith('.md')) {
            const file = await (fileEntry as FileSystemFileHandle).getFile();
            templates.push({
              name: fileName,
              content: await file.text(),
              lastModified: file.lastModified,
            });
          }
        }
      } catch {
        // templates folder doesn't exist yet
      }

      // Read signatures/
      try {
        const signaturesDir = await projectDir.getDirectoryHandle('signatures');
        for await (const [fileName, fileEntry] of signaturesDir.entries()) {
          if (fileEntry.kind === 'file' && fileName.endsWith('.md')) {
            const file = await (fileEntry as FileSystemFileHandle).getFile();
            signatures.push({
              name: fileName,
              content: await file.text(),
              lastModified: file.lastModified,
            });
          }
        }
      } catch {
        // signatures folder doesn't exist yet
      }

      projects.push({
        name,
        instructions,
        templates: templates.sort((a, b) => a.name.localeCompare(b.name)),
        signatures: signatures.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Save / Create / Rename a project
 */
export async function saveProjectToDisk(
  settingsHandle: FileSystemDirectoryHandle,
  oldName: string | null,
  newName: string,
  instructions?: string,
  duplicateFrom?: string | null
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  const cleanName = newName.trim();
  if (!cleanName) throw new Error('Project name cannot be empty.');

  let projectDir: FileSystemDirectoryHandle;

  if (duplicateFrom && duplicateFrom !== cleanName) {
    // Duplicating an existing project: copy instructions, templates, and signatures without deleting source
    let sourceInstructions = instructions !== undefined ? instructions : DEFAULT_INSTRUCTIONS;
    const sourceTemplates: Record<string, string> = {};
    const sourceSignatures: Record<string, string> = {};

    try {
      const srcDir = await projectsDir.getDirectoryHandle(duplicateFrom);
      if (instructions === undefined) {
        try {
          const f = await srcDir.getFileHandle('instructions.md');
          sourceInstructions = await (await f.getFile()).text();
        } catch {
          // ignore
        }
      }
      try {
        const td = await srcDir.getDirectoryHandle('templates');
        for await (const [tName, tEntry] of td.entries()) {
          if (tEntry.kind === 'file') {
            sourceTemplates[tName] = await (await (tEntry as FileSystemFileHandle).getFile()).text();
          }
        }
      } catch {
        // ignore
      }
      try {
        const sd = await srcDir.getDirectoryHandle('signatures');
        for await (const [sName, sEntry] of sd.entries()) {
          if (sEntry.kind === 'file') {
            sourceSignatures[sName] = await (await (sEntry as FileSystemFileHandle).getFile()).text();
          }
        }
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn(`Could not read source project ${duplicateFrom} for duplication:`, err);
    }

    projectDir = await projectsDir.getDirectoryHandle(cleanName, { create: true });
    const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
    const w = await instHandle.createWritable();
    await w.write(sourceInstructions);
    await w.close();

    const tDir = await projectDir.getDirectoryHandle('templates', { create: true });
    for (const [tn, tc] of Object.entries(sourceTemplates)) {
      const th = await tDir.getFileHandle(tn, { create: true });
      const tw = await th.createWritable();
      await tw.write(tc);
      await tw.close();
    }

    const sDir = await projectDir.getDirectoryHandle('signatures', { create: true });
    for (const [sn, sc] of Object.entries(sourceSignatures)) {
      const sh = await sDir.getFileHandle(sn, { create: true });
      const sw = await sh.createWritable();
      await sw.write(sc);
      await sw.close();
    }
  } else if (oldName && oldName !== cleanName) {
    // If renamed, copy contents if possible or create fresh
    let oldInstructions = instructions || DEFAULT_INSTRUCTIONS;
    const oldTemplates: Record<string, string> = {};
    const oldSignatures: Record<string, string> = {};

    try {
      const oldDir = await projectsDir.getDirectoryHandle(oldName);
      try {
        const f = await oldDir.getFileHandle('instructions.md');
        oldInstructions = await (await f.getFile()).text();
      } catch {
        // ignore
      }
      try {
        const td = await oldDir.getDirectoryHandle('templates');
        for await (const [tName, tEntry] of td.entries()) {
          if (tEntry.kind === 'file') {
            oldTemplates[tName] = await (await (tEntry as FileSystemFileHandle).getFile()).text();
          }
        }
      } catch {
        // ignore
      }
      try {
        const sd = await oldDir.getDirectoryHandle('signatures');
        for await (const [sName, sEntry] of sd.entries()) {
          if (sEntry.kind === 'file') {
            oldSignatures[sName] = await (await (sEntry as FileSystemFileHandle).getFile()).text();
          }
        }
      } catch {
        // ignore
      }

      await projectsDir.removeEntry(oldName, { recursive: true });
    } catch {
      // old didn't exist
    }

    projectDir = await projectsDir.getDirectoryHandle(cleanName, { create: true });
    const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
    const w = await instHandle.createWritable();
    await w.write(oldInstructions);
    await w.close();

    const tDir = await projectDir.getDirectoryHandle('templates', { create: true });
    for (const [tn, tc] of Object.entries(oldTemplates)) {
      const th = await tDir.getFileHandle(tn, { create: true });
      const tw = await th.createWritable();
      await tw.write(tc);
      await tw.close();
    }

    const sDir = await projectDir.getDirectoryHandle('signatures', { create: true });
    for (const [sn, sc] of Object.entries(oldSignatures)) {
      const sh = await sDir.getFileHandle(sn, { create: true });
      const sw = await sh.createWritable();
      await sw.write(sc);
      await sw.close();
    }
  } else {
    projectDir = await projectsDir.getDirectoryHandle(cleanName, { create: true });
    await projectDir.getDirectoryHandle('templates', { create: true });
    await projectDir.getDirectoryHandle('signatures', { create: true });

    if (instructions !== undefined) {
      const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
      const w = await instHandle.createWritable();
      await w.write(instructions);
      await w.close();
    } else {
      // check if instructions.md exists, if not write default
      try {
        await projectDir.getFileHandle('instructions.md');
      } catch {
        const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
        const w = await instHandle.createWritable();
        await w.write(DEFAULT_INSTRUCTIONS);
        await w.close();
      }
    }
  }
}

/**
 * Delete a project directory
 */
export async function deleteProjectFromDisk(
  settingsHandle: FileSystemDirectoryHandle,
  projectName: string
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  await projectsDir.removeEntry(projectName, { recursive: true });
}

/**
 * Save a template or signature file inside a project
 */
export async function saveProjectFileToDisk(
  settingsHandle: FileSystemDirectoryHandle,
  projectName: string,
  subfolder: 'templates' | 'signatures',
  filename: string,
  content: string
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  const projectDir = await projectsDir.getDirectoryHandle(projectName, { create: true });
  const subfolderDir = await projectDir.getDirectoryHandle(subfolder, { create: true });

  const cleanName = filename.endsWith('.md') ? filename : `${filename}.md`;
  const fileHandle = await subfolderDir.getFileHandle(cleanName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Delete a template or signature file inside a project
 */
export async function deleteProjectFileFromDisk(
  settingsHandle: FileSystemDirectoryHandle,
  projectName: string,
  subfolder: 'templates' | 'signatures',
  filename: string
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects');
  const projectDir = await projectsDir.getDirectoryHandle(projectName);
  const subfolderDir = await projectDir.getDirectoryHandle(subfolder);
  await subfolderDir.removeEntry(filename);
}

/**
 * Save instructions.md in a project
 */
export async function saveProjectInstructionsToDisk(
  settingsHandle: FileSystemDirectoryHandle,
  projectName: string,
  content: string
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  const projectDir = await projectsDir.getDirectoryHandle(projectName, { create: true });
  const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
  const writable = await instHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Permanently delete the assistant-settings folder and all its contents from disk
 */
export async function permanentlyDeleteSettingsFolder(
  settingsHandle: FileSystemDirectoryHandle
): Promise<void> {
  // 1. Recursively remove all files and subfolders inside assistant-settings
  try {
    for await (const [name] of settingsHandle.entries()) {
      try {
        await settingsHandle.removeEntry(name, { recursive: true });
      } catch (err) {
        console.warn(`Failed to remove entry ${name}:`, err);
      }
    }
  } catch (err) {
    console.warn('Failed to clear directory entries:', err);
  }

  // 2. Remove the folder handle itself if supported by browser File System Access API
  try {
    if (typeof settingsHandle.remove === 'function') {
      await settingsHandle.remove({ recursive: true });
    }
  } catch (err) {
    console.warn('handle.remove on folder itself was not permitted, all folder contents purged:', err);
  }
}

