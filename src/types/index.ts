export interface WorkspaceFile {
  name: string;
  content: string;
  lastModified?: number;
}

export interface ProfileConfig {
  name: string;
  apiKey: string;
  apiKeyProvider: 'gemini' | 'openai' | 'openrouter' | 'custom' | null;
  modelName: string;
}

export interface ProjectConfig {
  name: string;
  instructions: string;
  templates: WorkspaceFile[];
  signatures: WorkspaceFile[];
}

export interface SettingsConfigFile {
  activeProfile: string;
  activeProject: string;
}

export interface WorkspaceState {
  hasSettingsFolder: boolean;
  settingsFolderName: string;
  isFileSystemSupported: boolean;
  isFallbackMode: boolean;

  // Profiles
  profiles: ProfileConfig[];
  activeProfileName: string;

  // Projects
  projects: ProjectConfig[];
  activeProjectName: string;

  // Active session data derived from active profile & active project:
  apiKey: string;
  apiKeyProvider: 'gemini' | 'openai' | 'openrouter' | 'custom' | null;
  modelName: string;
  instructions: string; // Active instructions on disk/store
  sessionInstructions: string; // Locked into memory for current session
  templates: WorkspaceFile[];
  signatures: WorkspaceFile[];
  lastSyncedAt: Date | null;
}

export interface DraftState {
  incomingThread: string;
  keyPoints: string;
  selectedTemplate: string;
  selectedSignature: string;
  selectedTone: string;
  generatedReply: string;
  isGenerating: boolean;
  error: string | null;
}

export type PageTab = 'workspace' | 'settings' | 'templates' | 'help' | 'about';

export interface ToneOption {
  id: string;
  label: string;
  description: string;
  instruction: string;
}
