/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageTab, WorkspaceState } from './types';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  isFileSystemAccessSupported,
  pickAndInitializeSettingsFolder,
  readSettingsConfig,
  writeSettingsConfig,
  listProfiles,
  saveProfileToDisk,
  deleteProfileFromDisk,
  listProjects,
  saveProjectToDisk,
  deleteProjectFromDisk,
  saveProjectFileToDisk,
  deleteProjectFileFromDisk,
  permanentlyDeleteSettingsFolder,
  getActiveSettingsHandle,
  setActiveSettingsHandle,
  getDefaultTemplates,
  getDefaultSignatures,
  DirectoryPickerError,
} from './services/fileSystem';
import {
  saveSettingsFolder,
  getSavedSettingsFolder,
  clearSavedSettingsFolder,
} from './services/folderStorage';
import { SupportedLanguage, DEFAULT_INSTRUCTIONS_BY_LANG, TRANSLATIONS } from './i18n/translations';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, NotificationState } from './components/ToastContainer';
import { Modal } from './components/Modal';
import { WorkspacePage } from './pages/WorkspacePage';
import { SettingsPage } from './pages/SettingsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { HelpPage } from './pages/HelpPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  const isOnline = useOnlineStatus();
  const fsSupported = isFileSystemAccessSupported();

  // Floating top notification state
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showTopNotification = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 4500) => {
      setNotification({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        message,
        duration,
      });
    },
    []
  );

  // Language state (persisted as an app UI preference only)
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('email_draft_assistant_lang');
      if (saved === 'zh-TW' || saved === 'zh-CN' || saved === 'en') {
        return saved;
      }
    }
    return 'en';
  });

  // Tab navigation with URL hash synchronization
  const [activeTab, setActiveTabState] = useState<PageTab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (['workspace', 'settings', 'templates', 'help', 'about'].includes(hash)) {
        return hash as PageTab;
      }
    }
    return 'workspace';
  });

  const setActiveTab = (tab: PageTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = `/${tab}`;
    }
  };

  // Form dirty checks registry for all pages
  const pageDirtyCheckers = useRef<Partial<Record<PageTab, () => boolean>>>({});
  const handleRegisterDirtyCheck = useCallback((page: PageTab, checker: (() => boolean) | null) => {
    if (checker) {
      pageDirtyCheckers.current[page] = checker;
    } else {
      delete pageDirtyCheckers.current[page];
    }
  }, []);

  const [pendingTab, setPendingTab] = useState<PageTab | null>(null);
  const [showDiscardConfirmModal, setShowDiscardConfirmModal] = useState<boolean>(false);
  const [templatesSubfolder, setTemplatesSubfolder] = useState<'templates' | 'signatures'>('templates');
  const [pendingTemplatesSubfolder, setPendingTemplatesSubfolder] = useState<'templates' | 'signatures' | null>(null);

  // Intercept navigation to check if current page has an unsaved/filled form
  const handleRequestNavigate = useCallback(
    (targetTab: PageTab) => {
      if (targetTab === activeTab) return;

      const currentChecker = pageDirtyCheckers.current[activeTab];
      const isDirty = currentChecker ? currentChecker() : false;

      if (isDirty) {
        setPendingTab(targetTab);
        setShowDiscardConfirmModal(true);
        return;
      }

      setActiveTab(targetTab);
    },
    [activeTab]
  );

  const handleNavigateToTemplates = useCallback(
    (subfolder?: 'templates' | 'signatures') => {
      if (subfolder) {
        setTemplatesSubfolder(subfolder);
      }
      if (activeTab === 'templates') {
        return;
      }

      const currentChecker = pageDirtyCheckers.current[activeTab];
      const isDirty = currentChecker ? currentChecker() : false;

      if (isDirty) {
        setPendingTab('templates');
        if (subfolder) {
          setPendingTemplatesSubfolder(subfolder);
        }
        setShowDiscardConfirmModal(true);
        return;
      }

      setActiveTab('templates');
    },
    [activeTab]
  );

  const handleConfirmDiscard = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      if (pendingTab === 'templates' && pendingTemplatesSubfolder) {
        setTemplatesSubfolder(pendingTemplatesSubfolder);
      }
    }
    setPendingTab(null);
    setPendingTemplatesSubfolder(null);
    setShowDiscardConfirmModal(false);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (['workspace', 'settings', 'templates', 'help', 'about'].includes(hash)) {
        const targetTab = hash as PageTab;
        if (targetTab !== activeTab) {
          const currentChecker = pageDirtyCheckers.current[activeTab];
          if (currentChecker && currentChecker()) {
            setPendingTab(targetTab);
            setShowDiscardConfirmModal(true);
            window.location.hash = `/${activeTab}`;
            return;
          }
          setActiveTabState(targetTab);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Initial Workspace State
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => {
    const defaultInst = DEFAULT_INSTRUCTIONS_BY_LANG[language] || DEFAULT_INSTRUCTIONS_BY_LANG.en;
    return {
      hasSettingsFolder: false,
      settingsFolderName: '',
      isFileSystemSupported: fsSupported,
      isFallbackMode: false,
      profiles: [],
      activeProfileName: '',
      projects: [],
      activeProjectName: '',
      apiKey: '',
      apiKeyProvider: null,
      modelName: '',
      instructions: defaultInst,
      sessionInstructions: defaultInst,
      templates: getDefaultTemplates(),
      signatures: getDefaultSignatures(),
      lastSyncedAt: new Date(),
    };
  });

  // Helper to load all workspace state from a connected directory handle
  const loadWorkspaceFromHandle = useCallback(
    async (handle: FileSystemDirectoryHandle): Promise<void> => {
      const config = await readSettingsConfig(handle);
      const profiles = await listProfiles(handle);
      const projects = await listProjects(handle);

      // Determine active profile
      let activeProfileName = config.activeProfile;
      if (!profiles.some((p) => p.name === activeProfileName)) {
        activeProfileName = profiles[0]?.name || '';
      }
      const activeProfile = profiles.find((p) => p.name === activeProfileName) || null;

      // Determine active project
      let activeProjectName = config.activeProject;
      if (!projects.some((p) => p.name === activeProjectName)) {
        activeProjectName = projects[0]?.name || '';
      }
      const activeProject = projects.find((p) => p.name === activeProjectName) || null;

      // Persist corrected selections in settings.json if needed
      if (
        config.activeProfile !== activeProfileName ||
        config.activeProject !== activeProjectName
      ) {
        await writeSettingsConfig(handle, {
          activeProfile: activeProfileName,
          activeProject: activeProjectName,
        });
      }

      const defaultInst = DEFAULT_INSTRUCTIONS_BY_LANG[language] || DEFAULT_INSTRUCTIONS_BY_LANG.en;
      const currentInstructions = activeProject?.instructions || defaultInst;
      const currentTemplates = activeProject?.templates || [];
      const currentSignatures = activeProject?.signatures || [];

      setWorkspace((prev) => ({
        ...prev,
        hasSettingsFolder: true,
        settingsFolderName: handle.name,
        profiles,
        activeProfileName,
        projects,
        activeProjectName,
        apiKey: activeProfile?.apiKey || '',
        apiKeyProvider: activeProfile?.apiKeyProvider || null,
        modelName: activeProfile?.modelName || '',
        instructions: currentInstructions,
        sessionInstructions: currentInstructions,
        templates: currentTemplates,
        signatures: currentSignatures,
        lastSyncedAt: new Date(),
      }));
    },
    [language]
  );

  // Initialize and check saved settings folder handle on app startup
  useEffect(() => {
    let isMounted = true;

    async function initSettingsFolder() {
      const saved = await getSavedSettingsFolder();
      if (saved && isMounted) {
        try {
          const perm = typeof saved.handle.queryPermission === 'function'
            ? await saved.handle.queryPermission({ mode: 'readwrite' })
            : 'granted';
          if (perm === 'granted' && isMounted) {
            setActiveSettingsHandle(saved.handle);
            await loadWorkspaceFromHandle(saved.handle);
          }
        } catch (err) {
          console.warn('Could not auto-connect to saved settings folder:', err);
        }
      }
    }

    initSettingsFolder();

    return () => {
      isMounted = false;
    };
  }, [loadWorkspaceFromHandle]);

  // Language switch handler
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('email_draft_assistant_lang', newLang);
    }

    // If no project instructions are loaded, update default instructions in memory
    if (!workspace.activeProjectName) {
      const newPrompt = DEFAULT_INSTRUCTIONS_BY_LANG[newLang];
      setWorkspace((prev) => ({
        ...prev,
        instructions: newPrompt,
        sessionInstructions: newPrompt,
      }));
    }
  };

  // Choose / Pick settings folder location
  const handlePickSettingsFolder = async (): Promise<boolean> => {
    try {
      const { settingsHandle, displayName } = await pickAndInitializeSettingsFolder();
      await saveSettingsFolder(settingsHandle);
      await loadWorkspaceFromHandle(settingsHandle);

      showTopNotification(
        `${TRANSLATIONS[language].settings.folderConnectedSuccess}: ${displayName}`,
        'success'
      );
      return true;
    } catch (err: unknown) {
      if (err instanceof DirectoryPickerError && err.code === 'USER_CANCELLED') return false;
      showTopNotification(err instanceof Error ? err.message : String(err), 'error');
      return false;
    }
  };

  // Permanently delete settings folder from disk & clear storage
  const handleDisconnectSettingsFolder = async () => {
    const handle = getActiveSettingsHandle();
    if (handle) {
      try {
        await permanentlyDeleteSettingsFolder(handle);
      } catch (err) {
        console.warn('Failed to completely remove folder from disk:', err);
      }
    }

    setActiveSettingsHandle(null);
    await clearSavedSettingsFolder();

    const defaultInst = DEFAULT_INSTRUCTIONS_BY_LANG[language] || DEFAULT_INSTRUCTIONS_BY_LANG.en;
    setWorkspace((prev) => ({
      ...prev,
      hasSettingsFolder: false,
      settingsFolderName: '',
      profiles: [],
      activeProfileName: '',
      projects: [],
      activeProjectName: '',
      apiKey: '',
      apiKeyProvider: null,
      modelName: '',
      instructions: defaultInst,
      sessionInstructions: defaultInst,
      templates: getDefaultTemplates(),
      signatures: getDefaultSignatures(),
      lastSyncedAt: new Date(),
    }));

    showTopNotification('Settings data deleted permanently from disk.', 'info');
  };

  // Re-sync settings folder from disk
  const handleRefreshSettings = useCallback(async () => {
    const handle = getActiveSettingsHandle();
    if (!handle) return;

    try {
      await loadWorkspaceFromHandle(handle);
      showTopNotification('Settings re-synced successfully.', 'info');
    } catch (err) {
      showTopNotification('Failed to re-sync settings.', 'error');
    }
  }, [loadWorkspaceFromHandle, showTopNotification]);

  // Save / Update Profile
  const handleSaveProfile = async (
    oldName: string | null,
    newName: string,
    config: {
      apiKey: string;
      apiKeyProvider: 'gemini' | 'openai' | 'openrouter';
      modelName: string;
    },
    setAsActive: boolean
  ) => {
    const handle = getActiveSettingsHandle();
    if (!handle) throw new Error('No settings folder connected.');

    await saveProfileToDisk(handle, oldName, newName, config);

    // If active profile was renamed or should be active
    const shouldActivate = setAsActive || (oldName && workspace.activeProfileName === oldName);
    const updatedActiveProfile = shouldActivate ? newName : workspace.activeProfileName;

    await writeSettingsConfig(handle, {
      activeProfile: updatedActiveProfile,
      activeProject: workspace.activeProjectName,
    });

    await loadWorkspaceFromHandle(handle);
  };

  // Delete Profile
  const handleDeleteProfile = async (profileName: string) => {
    const handle = getActiveSettingsHandle();
    if (!handle) throw new Error('No settings folder connected.');

    await deleteProfileFromDisk(handle, profileName);

    const remainingProfiles = workspace.profiles.filter((p) => p.name !== profileName);
    const newActiveProfile =
      workspace.activeProfileName === profileName
        ? remainingProfiles[0]?.name || ''
        : workspace.activeProfileName;

    await writeSettingsConfig(handle, {
      activeProfile: newActiveProfile,
      activeProject: workspace.activeProjectName,
    });

    await loadWorkspaceFromHandle(handle);
    showTopNotification('Profile deleted.', 'info');
  };

  // Switch / Activate Profile
  const handleSetActiveProfile = async (profileName: string) => {
    const handle = getActiveSettingsHandle();
    if (!handle) return;

    await writeSettingsConfig(handle, {
      activeProfile: profileName,
      activeProject: workspace.activeProjectName,
    });

    const activeProfile = workspace.profiles.find((p) => p.name === profileName);
    setWorkspace((prev) => ({
      ...prev,
      activeProfileName: profileName,
      apiKey: activeProfile?.apiKey || '',
      apiKeyProvider: activeProfile?.apiKeyProvider || null,
      modelName: activeProfile?.modelName || '',
    }));

    showTopNotification(`Switched to profile: ${profileName}`, 'success');
  };

  // Save / Update Project
  const handleSaveProject = async (
    oldName: string | null,
    newName: string,
    instructions: string,
    setAsActive: boolean,
    duplicateFrom?: string | null
  ) => {
    const handle = getActiveSettingsHandle();
    if (!handle) throw new Error('No settings folder connected.');

    await saveProjectToDisk(handle, oldName, newName, instructions, duplicateFrom);

    const shouldActivate = setAsActive || (oldName && workspace.activeProjectName === oldName);
    const updatedActiveProject = shouldActivate ? newName : workspace.activeProjectName;

    await writeSettingsConfig(handle, {
      activeProfile: workspace.activeProfileName,
      activeProject: updatedActiveProject,
    });

    await loadWorkspaceFromHandle(handle);
  };

  // Delete Project
  const handleDeleteProject = async (projectName: string) => {
    const handle = getActiveSettingsHandle();
    if (!handle) throw new Error('No settings folder connected.');

    await deleteProjectFromDisk(handle, projectName);

    const remainingProjects = workspace.projects.filter((p) => p.name !== projectName);
    const newActiveProject =
      workspace.activeProjectName === projectName
        ? remainingProjects[0]?.name || ''
        : workspace.activeProjectName;

    await writeSettingsConfig(handle, {
      activeProfile: workspace.activeProfileName,
      activeProject: newActiveProject,
    });

    await loadWorkspaceFromHandle(handle);
    showTopNotification('Project deleted.', 'info');
  };

  // Switch / Activate Project
  const handleSetActiveProject = async (projectName: string) => {
    const handle = getActiveSettingsHandle();
    if (!handle) return;

    await writeSettingsConfig(handle, {
      activeProfile: workspace.activeProfileName,
      activeProject: projectName,
    });

    const project = workspace.projects.find((p) => p.name === projectName);
    const defaultInst = DEFAULT_INSTRUCTIONS_BY_LANG[language] || DEFAULT_INSTRUCTIONS_BY_LANG.en;
    const currentInstructions = project?.instructions || defaultInst;

    setWorkspace((prev) => ({
      ...prev,
      activeProjectName: projectName,
      instructions: currentInstructions,
      sessionInstructions: currentInstructions,
      templates: project?.templates || [],
      signatures: project?.signatures || [],
    }));

    showTopNotification(`Switched to project: ${projectName}`, 'success');
  };

  // Save template or signature file to active project
  const handleSaveFile = async (
    subfolder: 'templates' | 'signatures',
    filename: string,
    content: string,
    oldFilename?: string | null
  ) => {
    const handle = getActiveSettingsHandle();
    if (!handle || !workspace.activeProjectName) {
      throw new Error('No active project selected.');
    }

    const cleanNew = filename.endsWith('.md') ? filename : `${filename}.md`;
    if (oldFilename && oldFilename !== cleanNew) {
      try {
        await deleteProjectFileFromDisk(handle, workspace.activeProjectName, subfolder, oldFilename);
      } catch (err) {
        console.warn('Could not remove old file before rename:', err);
      }
    }

    await saveProjectFileToDisk(handle, workspace.activeProjectName, subfolder, cleanNew, content);
    await loadWorkspaceFromHandle(handle);
  };

  // Delete template or signature file from active project
  const handleDeleteFile = async (subfolder: 'templates' | 'signatures', filename: string) => {
    const handle = getActiveSettingsHandle();
    if (!handle || !workspace.activeProjectName) {
      throw new Error('No active project selected.');
    }

    await deleteProjectFileFromDisk(handle, workspace.activeProjectName, subfolder, filename);
    await loadWorkspaceFromHandle(handle);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex text-neutral-900 selection:bg-neutral-300 font-sans">
      {/* Unified Floating Toast Notifications */}
      <ToastContainer
        notification={notification}
        onDismiss={() => setNotification(null)}
        language={language}
      />

      {/* Left panel: links to different pages + language toggle + status at bottom */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleRequestNavigate}
        workspace={workspace}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Right panel: single column selected page with off-white background */}
      <main className="flex-1 bg-[#f8f9fa] min-h-screen overflow-y-auto">
        {activeTab === 'workspace' && (
          <WorkspacePage
            workspace={workspace}
            isOnline={isOnline}
            language={language}
            onNavigateToSettings={() => handleRequestNavigate('settings')}
            onNavigateToTemplates={handleNavigateToTemplates}
            onRegisterDirtyCheck={handleRegisterDirtyCheck}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            workspace={workspace}
            language={language}
            onPickSettingsFolder={handlePickSettingsFolder}
            onDisconnectSettingsFolder={handleDisconnectSettingsFolder}
            onRefreshSettings={handleRefreshSettings}
            onSaveProfile={handleSaveProfile}
            onDeleteProfile={handleDeleteProfile}
            onSetActiveProfile={handleSetActiveProfile}
            onSaveProject={handleSaveProject}
            onDeleteProject={handleDeleteProject}
            onSetActiveProject={handleSetActiveProject}
            onNavigateToTemplates={handleNavigateToTemplates}
            onRegisterDirtyCheck={handleRegisterDirtyCheck}
            showTopNotification={showTopNotification}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesPage
            workspace={workspace}
            language={language}
            onSaveFile={handleSaveFile}
            onDeleteFile={handleDeleteFile}
            onNavigateToSettings={() => handleRequestNavigate('settings')}
            onRegisterDirtyCheck={handleRegisterDirtyCheck}
            initialSubfolder={templatesSubfolder}
          />
        )}

        {activeTab === 'help' && <HelpPage language={language} />}

        {activeTab === 'about' && <AboutPage workspace={workspace} language={language} />}
      </main>

      {/* Modal: Confirm Discarding Unsaved Form */}
      <Modal
        isOpen={showDiscardConfirmModal}
        onClose={() => {
          setShowDiscardConfirmModal(false);
          setPendingTab(null);
          setPendingTemplatesSubfolder(null);
        }}
        title={TRANSLATIONS[language].discardModal.title}
        message={TRANSLATIONS[language].discardModal.description}
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                setShowDiscardConfirmModal(false);
                setPendingTab(null);
              }}
              className="btn-outline"
            >
              {TRANSLATIONS[language].discardModal.cancelBtn}
            </button>
            <button
              type="button"
              onClick={handleConfirmDiscard}
              className="btn-danger-outline"
            >
              {TRANSLATIONS[language].discardModal.discardBtn}
            </button>
          </>
        }
      />


    </div>
  );
}
