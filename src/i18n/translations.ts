export type SupportedLanguage = 'en' | 'zh-TW' | 'zh-CN';

import { DEFAULT_SYSTEM_PROMPTS } from '../services/promptConfig';

export interface Translations {
  appTitle: string;
  common: {
    dismiss: string;
    save: string;
    saving: string;
    saved: string;
  };
  nav: {
    workspace: string;
    settings: string;
    templates: string;
    help: string;
    about: string;
    aboutTheApp: string;
  };
  status: {
    title: string;
    folder: string;
    key: string;
    model: string;
    provided: string;
    notProvided: string;
    profile: string;
    project: string;
    none: string;
  };
  workspace: {
    emailContext: string;
    generatedDraft: string;
    template: string;
    signature: string;
    noneOption: string;
    noneCustomReply: string;
    noTemplateSelected: string;
    noSignatureSelected: string;
    createTemplateDropdown: string;
    createSignatureDropdown: string;
    tone: string;
    tones: Record<string, { label: string; description: string; instruction: string }>;
    emailToReply: string;
    emailPlaceholder: string;
    keyPoints: string;
    keyPointsPlaceholder: string;
    clear: string;
    clearConfirm: string;
    generateBtn: string;
    generatingBtn: string;
    generatedReply: string;
    replyPlaceholder: string;
    draftPlaceholder: string;
    appendSignature: string;
    refine: string;
    shorter: string;
    moreFormal: string;
    warm: string;
    regenerate: string;
    copy: string;
    copied: string;
    copyPromptBtn: string;
    promptCopied: string;
    copyPromptTooltip: string;
    noKeyWarning: string;
    goToSettings: string;
    offlineWarning: string;
    currentModel: string;
  };
  settings: {
    title: string;
    settingsFolderLabel: string;
    reloadBtn: string;
    saveAsBtn: string;
    changeLocationBtn: string;
    deleteSettingsBtn: string;
    setupPromptDesc: string;
    profilesTab: string;
    projectsTab: string;
    newProfile: string;
    newProject: string;
    searchProfiles: string;
    searchProjects: string;
    noProfilesFound: string;
    noProjectsFound: string;
    profileName: string;
    profileNamePlaceholder: string;
    projectName: string;
    projectNamePlaceholder: string;
    provider: string;
    geminiOption: string;
    openaiOption: string;
    openrouterOption: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    keyStatusProvided: string;
    keyStatusNotProvided: string;
    modelName: string;
    modelNameDesc: string;
    modelNamePlaceholder: string;
    activeBadge: string;
    setAsActive: string;
    saveProfileBtn: string;
    saveProjectBtn: string;
    savingBtn: string;
    savedBtn: string;
    deleteBtn: string;
    deleteConfirm: string;
    cancelBtn: string;
    confirmDeleteProfileTitle: string;
    confirmDeleteProfileDesc: string;
    confirmDeleteProjectTitle: string;
    confirmDeleteProjectDesc: string;
    confirmDeleteSettingsTitle: string;
    confirmDeleteSettingsDesc: string;
    confirmChangeLocationTitle: string;
    confirmChangeLocationDesc: string;
    continueBtn: string;
    duplicateProfileTooltip: string;
    duplicateProjectTooltip: string;
    emptyNameWarning: string;
    projectInstructionsTitle: string;
    templatesTitle: string;
    signaturesTitle: string;
    savedSuccess: string;
    projectSavedSuccess: string;
    profileDeletedSuccess: string;
    projectDeletedSuccess: string;
    settingsDataDeletedSuccess: string;
    folderConnectedSuccess: string;
    noProfileSelected: string;
    noProjectSelected: string;
    noFolderWarning: string;
    editProfileNameTooltip: string;
    editProjectNameTooltip: string;
    useDefaultBtn: string;
    projectInstructionsPlaceholder: string;
  };
  templates: {
    title: string;
    templatesTab: string;
    signaturesTab: string;
    newFile: string;
    searchPlaceholder: string;
    noFilesFound: string;
    filename: string;
    noFileSelected: string;
    saveFile: string;
    saving: string;
    saved: string;
    deleteBtn: string;
    deleteConfirm: string;
    characters: string;
    templatePlaceholder: string;
    signaturePlaceholder: string;
    noFolderWarning: string;
    noProjectWarning: string;
    goToSettings: string;
    editFileNameTooltip: string;
    duplicateFileTooltip: string;
    emptyNameWarning: string;
    cancelBtn: string;
    fileSavedSuccess: string;
    fileDeletedSuccess: string;
    currentProject: string;
    switchProjectInSettings: string;
  };
  discardModal: {
    title: string;
    description: string;
    discardBtn: string;
    cancelBtn: string;
  };
  help: {
    title: string;
    shortcuts: string;
    generateShortcut: string;
    copyShortcut: string;
    folderStructure: string;
    folderDesc: string;
    envFile: string;
    envDesc: string;
    copy: string;
    copied: string;
  };
  about: {
    title: string;
    description: string;
    version: string;
    license: string;
    developer: string;
    sourceCode: string;
    pullRequest: string;
    feedback: string;
  };
}

export const DEFAULT_INSTRUCTIONS_BY_LANG: Record<SupportedLanguage, string> = DEFAULT_SYSTEM_PROMPTS;

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: 'Email Draft Assistant',
    common: {
      dismiss: 'Dismiss',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved!',
    },
    nav: {
      workspace: 'Workspace',
      settings: 'Settings',
      templates: 'Templates & Signatures',
      help: 'Help',
      about: 'About',
      aboutTheApp: 'About the app',
    },
    status: {
      title: 'Status',
      folder: 'Folder',
      key: 'Key',
      model: 'Model',
      provided: 'Provided',
      notProvided: 'Not provided',
      profile: 'Profile',
      project: 'Project',
      none: 'None',
    },
    workspace: {
      emailContext: 'Email Context',
      generatedDraft: 'Generated Draft',
      template: 'Template',
      signature: 'Signature',
      noneOption: 'None',
      noneCustomReply: 'None (Custom Reply)',
      noTemplateSelected: 'Optional: Template',
      noSignatureSelected: 'Optional: Signature',
      createTemplateDropdown: 'Create template...',
      createSignatureDropdown: 'Create signature...',
      tone: 'Tone',
      tones: {
        'polite-refusal': {
          label: 'Polite Refusal',
          description: 'Gracefully decline with courtesy',
          instruction: 'Politely and clearly decline the request while expressing appreciation.',
        },
        'accept-time': {
          label: 'Accept & Propose Time',
          description: 'Accept and suggest meeting slots',
          instruction: 'Enthusiastically accept the invitation or request. Offer 2 or 3 convenient time slots for a follow-up.',
        },
        concise: {
          label: 'Concise',
          description: 'Direct and brief',
          instruction: 'Keep the response extremely brief and direct (under 4-5 sentences). Eliminate fluff.',
        },
        formal: {
          label: 'Formal',
          description: 'Executive and diplomatic',
          instruction: 'Use an executive, diplomatic, and highly professional tone suitable for external clients.',
        },
        'friendly-warm': {
          label: 'Friendly & Warm',
          description: 'Approachable and collaborative',
          instruction: 'Use an approachable, warm, and collaborative tone while maintaining professionalism.',
        },
      },
      emailToReply: 'Email to reply',
      emailPlaceholder: 'Optional: Paste the email you want to reply to here',
      keyPoints: 'Key points to include',
      keyPointsPlaceholder: 'Key points to include, e.g. confirm meeting time...',
      clear: 'Clear',
      clearConfirm: 'Press again to confirm',
      generateBtn: 'Generate (Ctrl+Enter)',
      generatingBtn: 'Generating...',
      generatedReply: 'Generated Reply',
      replyPlaceholder: 'Generated reply will appear here...',
      draftPlaceholder: 'Generated email draft will appear here',
      appendSignature: 'Append Signature',
      refine: 'Refine:',
      shorter: 'Shorter',
      moreFormal: 'More Formal',
      warm: 'Warm',
      regenerate: 'Regenerate',
      copy: 'Copy to Clipboard (Ctrl+S)',
      copied: 'Copied!',
      copyPromptBtn: 'Copy Final Prompt',
      promptCopied: 'Copied!',
      copyPromptTooltip: 'Copy the complete prompt that will be sent to the LLM',
      noKeyWarning: 'Please set up a profile with an API key for your LLM.',
      goToSettings: 'Go to Settings',
      offlineWarning: 'LLM reply generation requires an active internet connection.',
      currentModel: 'Active Model',
    },
    settings: {
      title: 'Settings',
      settingsFolderLabel: 'Settings Folder:',
      reloadBtn: 'Reload',
      saveAsBtn: 'Save As...',
      changeLocationBtn: 'Change Location',
      deleteSettingsBtn: 'Delete Settings Data',
      setupPromptDesc: 'Please configure your profile below to enable LLM generation.',
      noFolderWarning: 'Pick a location on your computer to save settings.',
      profilesTab: 'Profiles',
      projectsTab: 'Projects',
      newProfile: 'New Profile',
      newProject: 'New Project',
      searchProfiles: 'Search profiles...',
      searchProjects: 'Search projects...',
      noProfilesFound: 'No profiles found',
      noProjectsFound: 'No projects found',
      profileName: 'Profile Name',
      profileNamePlaceholder: 'Profile name, e.g. Work, Personal...',
      projectName: 'Project Name',
      projectNamePlaceholder: 'Project name, e.g. Sales, Support...',
      provider: 'Provider',
      geminiOption: 'Google Gemini',
      openaiOption: 'OpenAI',
      openrouterOption: 'OpenRouter',
      apiKey: 'API Key',
      apiKeyPlaceholder: 'Enter API key...',
      keyStatusProvided: 'Key configured in profile .env',
      keyStatusNotProvided: 'Key not configured',
      modelName: 'Model Name / Path',
      modelNameDesc: 'Specify the model identifier for this profile.',
      modelNamePlaceholder: 'e.g. gpt-4o, claude-3-5-sonnet, gemini-2.5-flash',
      activeBadge: 'Active',
      setAsActive: 'Set as Active',
      saveProfileBtn: 'Save',
      saveProjectBtn: 'Save',
      savingBtn: 'Saving...',
      savedBtn: 'Saved!',
      deleteBtn: 'Delete',
      deleteConfirm: 'Click again to confirm',
      cancelBtn: 'Cancel',
      confirmDeleteProfileTitle: 'Delete Profile?',
      confirmDeleteProfileDesc: 'This will permanently remove this profile folder and its .env configuration file from disk.',
      confirmDeleteProjectTitle: 'Delete Project?',
      confirmDeleteProjectDesc: 'This will permanently remove this project folder and its instructions, templates, and signatures from disk.',
      confirmDeleteSettingsTitle: 'Delete Settings Data?',
      confirmDeleteSettingsDesc: 'This will permanently delete the "assistant-settings" folder and all its profiles and projects from your disk.',
      confirmChangeLocationTitle: 'Change Settings Folder Location?',
      confirmChangeLocationDesc: 'The current settings folder may contain sensitive or private configuration data (such as API keys and profiles). Please ensure you know where it is stored and remove any sensitive files if needed. For your security, this app does not remember previous folder locations. We recommend deleting the current settings folder data before changing location if you are on a shared or public computer.',
      continueBtn: 'Continue',
      duplicateProfileTooltip: 'Duplicate profile',
      duplicateProjectTooltip: 'Duplicate project',
      emptyNameWarning: 'Name cannot be empty. Please enter a valid name.',
      projectInstructionsTitle: 'Project Instructions',
      templatesTitle: 'Templates',
      signaturesTitle: 'Signatures',
      savedSuccess: 'Profile configuration saved to disk.',
      projectSavedSuccess: 'Project configuration saved to disk.',
      profileDeletedSuccess: 'Profile deleted.',
      projectDeletedSuccess: 'Project deleted.',
      settingsDataDeletedSuccess: 'Settings data deleted permanently from disk.',
      folderConnectedSuccess: 'Settings folder connected successfully.',
      noProfileSelected: 'Create a profile to configure API credentials.',
      noProjectSelected: 'Create a project to configure instructions and templates.',
      editProfileNameTooltip: 'Edit profile name',
      editProjectNameTooltip: 'Edit project name',
      useDefaultBtn: 'Use default',
      projectInstructionsPlaceholder: 'Enter custom project instructions for this project, or click "Use default"...',
    },
    templates: {
      title: 'Templates & Signatures',
      templatesTab: 'Templates',
      signaturesTab: 'Signatures',
      newFile: 'New File',
      searchPlaceholder: 'Search files...',
      noFilesFound: 'No files found',
      filename: 'Filename (e.g. follow-up.md)',
      noFileSelected: 'No file selected',
      saveFile: 'Save',
      saving: 'Saving...',
      saved: 'Saved!',
      deleteBtn: 'Delete',
      deleteConfirm: 'Press again to confirm',
      characters: 'characters',
      templatePlaceholder: 'Write markdown email template...',
      signaturePlaceholder: 'Write markdown signature...',
      noFolderWarning: 'Please set up a settings folder first in the Settings page.',
      noProjectWarning: 'Please add a project in Settings to create and manage templates & signatures.',
      goToSettings: 'Go to Settings',
      editFileNameTooltip: 'Edit file name',
      duplicateFileTooltip: 'Duplicate file',
      emptyNameWarning: 'File name cannot be empty. Please enter a valid file name.',
      cancelBtn: 'Cancel',
      fileSavedSuccess: 'File saved successfully.',
      fileDeletedSuccess: 'File deleted.',
      currentProject: 'Current Project:',
      switchProjectInSettings: 'Switch Project in Settings',
    },
    discardModal: {
      title: 'Discard Unsaved Form?',
      description: 'You have unsaved changes or filled form content on this page. If you leave now, your input will be discarded. Do you want to continue?',
      discardBtn: 'Discard & Leave',
      cancelBtn: 'Cancel',
    },
    help: {
      title: 'Help & Shortcuts',
      shortcuts: 'Keyboard Shortcuts',
      generateShortcut: 'Generate email draft (Workspace)',
      copyShortcut: 'Copy generated draft to clipboard',
      folderStructure: 'Configuration Structure',
      folderDesc: 'All settings are stored locally in the "assistant-settings" folder containing /profiles/<name>/.env and /projects/<name>/(instructions, templates, signatures).',
      envFile: 'Profile .env Format',
      envDesc: 'Each profile folder contains its own isolated .env configuration file:',
      copy: 'Copy',
      copied: 'Copied!',
    },
    about: {
      title: 'About',
      description: 'An offline-first AI Email Draft Assistant with isolated multi-profile and multi-project configuration support.',
      version: 'Version',
      license: 'License',
      developer: 'Developer',
      sourceCode: 'Source Code',
      pullRequest: 'Pull request',
      feedback: 'Feedback',
    },
  },

  'zh-TW': {
    appTitle: 'Email Draft Assistant',
    common: {
      dismiss: '關閉',
      save: '儲存',
      saving: '儲存中...',
      saved: '已儲存！',
    },
    nav: {
      workspace: '工作區',
      settings: '設定',
      templates: '範本與簽名',
      help: '說明',
      about: '關於',
      aboutTheApp: '關於此應用程式',
    },
    status: {
      title: '狀態',
      folder: '資料夾',
      key: '金鑰',
      model: '模型',
      provided: '已設定',
      notProvided: '未設定',
      profile: '設定檔',
      project: '專案',
      none: '無',
    },
    workspace: {
      emailContext: '郵件情境與指示',
      generatedDraft: '生成內容',
      template: '郵件範本',
      signature: '簽名檔',
      noneOption: '無',
      noneCustomReply: '無（自訂回覆）',
      noTemplateSelected: '選填：郵件範本',
      noSignatureSelected: '選填：簽名檔',
      createTemplateDropdown: '建立範本...',
      createSignatureDropdown: '建立簽名檔...',
      tone: '語氣設定',
      tones: {
        'polite-refusal': {
          label: '禮貌謝絕',
          description: '客氣婉拒並致以感謝',
          instruction: '以委婉得體的方式謝絕請求或邀請，同時誠摯致謝。',
        },
        'accept-time': {
          label: '接受並預約時間',
          description: '欣然應允並建議面談時段',
          instruction: '熱情且專業地接受邀請，並提出2至3個合適的後續通話或會議時段。',
        },
        concise: {
          label: '精練簡明',
          description: '直截了當且重點明確',
          instruction: '保持回覆極為精煉直接（4-5句內），去除多餘客套，開門見山。',
        },
        formal: {
          label: '商務正式',
          description: '專業嚴謹且得體尊崇',
          instruction: '使用高規格商務正式語氣，適合外部客戶、主管或正式商談。',
        },
        'friendly-warm': {
          label: '親切溫暖',
          description: '和藹可親且富合作感',
          instruction: '在保持職場專業的同時，展現溫暖、真誠且易於協作的語調。',
        },
      },
      emailToReply: '欲回覆的信件',
      emailPlaceholder: '選填：在此貼上您要回覆的郵件...',
      keyPoints: '回覆重點與補充指示',
      keyPointsPlaceholder: '請輸入要包含的要點，例如：確認會議時間...',
      clear: '清空內容',
      clearConfirm: '再次點擊以確認',
      generateBtn: '生成 (Ctrl+Enter)',
      generatingBtn: '正在生成草稿...',
      generatedReply: '生成的回覆',
      replyPlaceholder: 'AI 生成的郵件回覆將在此顯示...',
      draftPlaceholder: '生成的郵件草稿將在此處顯示',
      appendSignature: '插入簽名',
      refine: '潤飾：',
      shorter: '更簡短',
      moreFormal: '更正式',
      warm: '更親切',
      regenerate: '重新生成',
      copy: '複製到剪貼簿 (Ctrl+S)',
      copied: '已複製！',
      copyPromptBtn: '複製完整提示詞',
      promptCopied: '已複製！',
      copyPromptTooltip: '複製發送給 LLM 的完整提示詞',
      noKeyWarning: '請在設定檔中輸入您的 LLM API 金鑰。',
      goToSettings: '前往設定',
      offlineWarning: '生成 AI 草稿需要連接網際網路。',
      currentModel: '目前使用模型',
    },
    settings: {
      title: '設定',
      settingsFolderLabel: '設定資料夾：',
      reloadBtn: '重新載入',
      saveAsBtn: '另存新檔...',
      changeLocationBtn: '變更位置',
      deleteSettingsBtn: '刪除設定資料',
      setupPromptDesc: '請在下方填寫您的設定檔以啟用 LLM 生成功能。',
      noFolderWarning: '請選擇電腦上的位置以儲存設定。',
      profilesTab: '設定檔',
      projectsTab: '專案',
      newProfile: '新增設定檔',
      newProject: '新增專案',
      searchProfiles: '搜尋設定檔...',
      searchProjects: '搜尋專案...',
      noProfilesFound: '找不到相符設定檔',
      noProjectsFound: '找不到相符專案',
      profileName: '設定檔名稱',
      profileNamePlaceholder: '設定檔名稱，例如：Work，Personal...',
      projectName: '專案名稱',
      projectNamePlaceholder: '專案名稱，例如：Sales，Support...',
      provider: '模型提供商',
      geminiOption: 'Google Gemini',
      openaiOption: 'OpenAI',
      openrouterOption: 'OpenRouter',
      apiKey: 'API 金鑰',
      apiKeyPlaceholder: '輸入 API 金鑰...',
      keyStatusProvided: '金鑰已於設定檔 .env 中設定',
      keyStatusNotProvided: '金鑰未設定',
      modelName: '模型名稱／路徑',
      modelNameDesc: '指定此設定檔使用的模型代碼。',
      modelNamePlaceholder: '例如：gpt-4o，claude-3-5-sonnet，gemini-2.5-flash',
      activeBadge: '已啟用',
      setAsActive: '啟用',
      saveProfileBtn: '儲存',
      saveProjectBtn: '儲存',
      savingBtn: '儲存中...',
      savedBtn: '已儲存！',
      deleteBtn: '刪除',
      deleteConfirm: '再次點擊確認刪除',
      cancelBtn: '取消',
      confirmDeleteProfileTitle: '確定刪除設定檔？',
      confirmDeleteProfileDesc: '這將永久從硬碟刪除該設定檔資料夾及其 .env 檔案。',
      confirmDeleteProjectTitle: '確定刪除專案？',
      confirmDeleteProjectDesc: '這將永久從硬碟刪除該專案資料夾及其指令、範本與簽名檔。',
      confirmDeleteSettingsTitle: '確定刪除設定資料？',
      confirmDeleteSettingsDesc: '這將從硬碟永久刪除 "assistant-settings" 資料夾及其所有設定檔與專案。',
      confirmChangeLocationTitle: '變更設定資料夾位置？',
      confirmChangeLocationDesc: '目前設定資料夾中可能包含私密資訊（如 API 金鑰與設定檔）。請務必記住該資料夾的存放位置，並於需要時清除機密內容。基於安全性考量，本應用程式不會記錄先前的資料夾路徑。若您使用的是共用或公用電腦，建議在變更位置前先刪除目前的設定資料夾。',
      continueBtn: '繼續',
      duplicateProfileTooltip: '複製設定檔',
      duplicateProjectTooltip: '複製專案',
      emptyNameWarning: '名稱不能為空，請輸入有效名稱。',
      projectInstructionsTitle: '專案指令',
      templatesTitle: '範本',
      signaturesTitle: '簽名檔',
      savedSuccess: '設定檔已儲存至磁碟。',
      projectSavedSuccess: '專案已儲存至磁碟。',
      profileDeletedSuccess: '設定檔已刪除。',
      projectDeletedSuccess: '專案已刪除。',
      settingsDataDeletedSuccess: '設定資料已永久從磁碟刪除。',
      folderConnectedSuccess: '已成功連接設定資料夾。',
      noProfileSelected: '建立設定檔以配置 API 憑證。',
      noProjectSelected: '建立專案以配置專案指令與範本。',
      editProfileNameTooltip: '編輯設定檔名稱',
      editProjectNameTooltip: '編輯專案名稱',
      useDefaultBtn: '使用預設值',
      projectInstructionsPlaceholder: '輸入此專案的自訂專案指令，或點選「使用預設值」...',
    },
    templates: {
      title: '範本與簽名',
      templatesTab: '郵件範本',
      signaturesTab: '簽名檔',
      newFile: '新增檔案',
      searchPlaceholder: '搜尋檔案...',
      noFilesFound: '找不到相符檔案',
      filename: '檔案名稱（例如 follow-up.md）',
      noFileSelected: '未選擇檔案',
      saveFile: '儲存',
      saving: '儲存中...',
      saved: '已儲存！',
      deleteBtn: '刪除',
      deleteConfirm: '再次點擊以確認',
      characters: '字元數',
      templatePlaceholder: '請輸入 Markdown 格式的電郵範本...',
      signaturePlaceholder: '請輸入 Markdown 格式的簽名檔...',
      noFolderWarning: '請先前往「設定」頁面完成設定資料夾配置。',
      noProjectWarning: '請在「設定」中新增專案以建立與管理範本與簽名檔。',
      goToSettings: '前往設定',
      editFileNameTooltip: '編輯檔案名稱',
      duplicateFileTooltip: '複製檔案',
      emptyNameWarning: '檔案名稱不能為空，請輸入有效檔案名稱。',
      cancelBtn: '取消',
      fileSavedSuccess: '檔案已成功儲存。',
      fileDeletedSuccess: '檔案已刪除。',
      currentProject: '目前專案：',
      switchProjectInSettings: '在設定中切換專案',
    },
    discardModal: {
      title: '確定放棄未儲存的表單？',
      description: '本頁面有未儲存或已填寫的表單內容。若現在離開，這些內容將會遺失。您確定要繼續嗎？',
      discardBtn: '放棄並離開',
      cancelBtn: '取消',
    },
    help: {
      title: '說明與快捷鍵',
      shortcuts: '鍵盤快捷鍵',
      generateShortcut: '生成郵件草稿（工作區）',
      copyShortcut: '複製草稿至剪貼簿',
      folderStructure: '設定目錄結構',
      folderDesc: '所有組態均儲存於本機 "assistant-settings" 目錄，內含 /profiles/<名稱>/.env 與 /projects/<名稱>/(instructions, templates, signatures)。',
      envFile: '設定檔 .env 格式',
      envDesc: '每個設定檔資料夾皆包含獨立的 .env 設定檔：',
      copy: '複製',
      copied: '已複製！',
    },
    about: {
      title: '關於',
      description: '具備離線運行能力的 AI 電郵草稿助手，支援多設定檔與多專案獨立組態管理。',
      version: '版本',
      license: '授權條款',
      developer: '開發者',
      sourceCode: '原始碼',
      pullRequest: 'Pull request (拉取請求)',
      feedback: '建議',
    },
  },

  'zh-CN': {
    appTitle: 'Email Draft Assistant',
    common: {
      dismiss: '关闭',
      save: '保存',
      saving: '保存中...',
      saved: '已保存！',
    },
    nav: {
      workspace: '工作区',
      settings: '设置',
      templates: '模板与签名',
      help: '帮助',
      about: '关于',
      aboutTheApp: '关于此应用',
    },
    status: {
      title: '状态',
      folder: '文件夹',
      key: '密钥',
      model: '模型',
      provided: '已配置',
      notProvided: '未配置',
      profile: '配置文件',
      project: '项目',
      none: '无',
    },
    workspace: {
      emailContext: '邮件上下文与指示',
      generatedDraft: '生成内容',
      template: '邮件模板',
      signature: '签名档',
      noneOption: '无',
      noneCustomReply: '无（自定义回复）',
      noTemplateSelected: '选填：邮件模板',
      noSignatureSelected: '选填：签名',
      createTemplateDropdown: '新建模板...',
      createSignatureDropdown: '新建签名...',
      tone: '语气设定',
      tones: {
        'polite-refusal': {
          label: '礼貌谢绝',
          description: '委婉谢绝并表达感谢',
          instruction: '以委婉得体的方式谢绝请求或邀请，并表达真诚谢意。',
        },
        'accept-time': {
          label: '接受并提议时间',
          description: '欣然应允并建议沟通时间',
          instruction: '热情且专业地接受邀请，并提供2至3个合适的后续沟通时段。',
        },
        concise: {
          label: '简明扼要',
          description: '直截了当且突出重点',
          instruction: '保持回复极为精炼直接（4-5句以内），去除冗余客套，开门见山。',
        },
        formal: {
          label: '商务正式',
          description: '专业严谨且得体尊重',
          instruction: '使用高规格商务正式语气，适合外部客户、管理层或正式业务沟通。',
        },
        'friendly-warm': {
          label: '热情亲和',
          description: '平易近人且富有协作感',
          instruction: '在保持职业素养的同时，展现温暖、真诚且便于协作的语调。',
        },
      },
      emailToReply: '欲回复的邮件',
      emailPlaceholder: '选填：在此粘贴您要回复的邮件...',
      keyPoints: '回复要点与补充指示',
      keyPointsPlaceholder: '请输入要包含的要点，例如：确认会议时间...',
      clear: '清空内容',
      clearConfirm: '再次点击以确认',
      generateBtn: '生成 (Ctrl+Enter)',
      generatingBtn: '正在生成草稿...',
      generatedReply: '生成的回复',
      replyPlaceholder: 'AI 生成的邮件回复将显示在此处...',
      draftPlaceholder: '生成的邮件草稿将在此处显示',
      appendSignature: '插入签名',
      refine: '微调：',
      shorter: '更简短',
      moreFormal: '更正式',
      warm: '更亲和',
      regenerate: '重新生成',
      copy: '复制到剪贴板 (Ctrl+S)',
      copied: '已复制！',
      copyPromptBtn: '复制完整提示词',
      promptCopied: '已复制！',
      copyPromptTooltip: '复制发送给 LLM 的完整提示词',
      noKeyWarning: '请在配置文件中輸入您的 LLM API 密钥。',
      goToSettings: '前往设置',
      offlineWarning: '生成 AI 草稿需要连接互联网。',
      currentModel: '当前使用模型',
    },
    settings: {
      title: '设置',
      settingsFolderLabel: '设置文件夹：',
      reloadBtn: '重新加载',
      saveAsBtn: '另存为...',
      changeLocationBtn: '更改位置',
      deleteSettingsBtn: '删除设置数据',
      setupPromptDesc: '请在下方填写您的配置文件以启用 LLM 生成功能。',
      noFolderWarning: '请选择电脑上的位置以保存设置。',
      profilesTab: '配置文件',
      projectsTab: '项目',
      newProfile: '新建配置文件',
      newProject: '新建项目',
      searchProfiles: '搜索配置文件...',
      searchProjects: '搜索项目...',
      noProfilesFound: '未找到匹配配置文件',
      noProjectsFound: '未找到匹配项目',
      profileName: '配置文件名称',
      profileNamePlaceholder: '配置文件名称，例如：Work，Personal...',
      projectName: '项目名称',
      projectNamePlaceholder: '项目名称，例如：Sales，Support...',
      provider: '模型提供商',
      geminiOption: 'Google Gemini',
      openaiOption: 'OpenAI',
      openrouterOption: 'OpenRouter',
      apiKey: 'API 密钥',
      apiKeyPlaceholder: '输入 API 密钥...',
      keyStatusProvided: '密钥已在配置文件 .env 中配置',
      keyStatusNotProvided: '密钥未配置',
      modelName: '模型名称／路径',
      modelNameDesc: '指定此配置文件使用的模型标识符。',
      modelNamePlaceholder: '例如：gpt-4o，claude-3-5-sonnet，gemini-2.5-flash',
      activeBadge: '已启用',
      setAsActive: '启用',
      saveProfileBtn: '保存',
      saveProjectBtn: '保存',
      savingBtn: '保存中...',
      savedBtn: '已保存！',
      deleteBtn: '删除',
      deleteConfirm: '再次点击确认删除',
      cancelBtn: '取消',
      confirmDeleteProfileTitle: '确定删除配置文件？',
      confirmDeleteProfileDesc: '这将永久从硬盘中删除该配置文件文件夹及其 .env 文件。',
      confirmDeleteProjectTitle: '确定删除项目？',
      confirmDeleteProjectDesc: '这将永久从硬盘中删除该项目文件夹及其指令、模板与签名文件。',
      confirmDeleteSettingsTitle: '确定删除设置数据？',
      confirmDeleteSettingsDesc: '这将从硬盘中永久删除 "assistant-settings" 文件夹及其全部配置文件和项目。',
      confirmChangeLocationTitle: '更改设置文件夹位置？',
      confirmChangeLocationDesc: '当前设置文件夹中可能包含敏感或私密配置（如 API 密钥与配置文件）。请务必记住该文件夹的存储位置，并在需要时清理相关信息。出于安全考虑，本应用不会记住先前的文件夹路径。如果您在共享或公用电脑上使用，建议在更改位置前先删除当前设置文件夹。',
      continueBtn: '继续',
      duplicateProfileTooltip: '复制配置文件',
      duplicateProjectTooltip: '复制项目',
      emptyNameWarning: '名称不能为空，请输入有效名称。',
      projectInstructionsTitle: '项目指令',
      templatesTitle: '模板',
      signaturesTitle: '签名档',
      savedSuccess: '配置文件已保存至磁盘。',
      projectSavedSuccess: '项目已保存至磁盘。',
      profileDeletedSuccess: '配置文件已删除。',
      projectDeletedSuccess: '项目已删除。',
      settingsDataDeletedSuccess: '设置数据已永久从磁盘删除。',
      folderConnectedSuccess: '已成功连接设置文件夹。',
      noProfileSelected: '创建配置文件以配置 API 凭证。',
      noProjectSelected: '创建项目以配置项目指令与模板。',
      editProfileNameTooltip: '编辑配置文件名称',
      editProjectNameTooltip: '编辑项目名称',
      useDefaultBtn: '使用默认值',
      projectInstructionsPlaceholder: '输入此项目的自定义项目指令，或点击“使用默认值”...',
    },
    templates: {
      title: '模板与签名',
      templatesTab: '邮件模板',
      signaturesTab: '签名档',
      newFile: '新建文件',
      searchPlaceholder: '搜索文件...',
      noFilesFound: '未找到匹配文件',
      filename: '文件名称（例如 follow-up.md）',
      noFileSelected: '未选择文件',
      saveFile: '保存',
      saving: '保存中...',
      saved: '已保存！',
      deleteBtn: '删除',
      deleteConfirm: '再次点击以确认',
      characters: '字符数',
      templatePlaceholder: '请输入 Markdown 格式的邮件模板...',
      signaturePlaceholder: '请输入 Markdown 格式的签名档...',
      noFolderWarning: '请先前往“设置”页面完成设置文件夹配置。',
      noProjectWarning: '请在“设置”中新建项目以创建与管理模板与签名档。',
      goToSettings: '前往设置',
      editFileNameTooltip: '编辑文件名称',
      duplicateFileTooltip: '复制文件',
      emptyNameWarning: '文件名不能为空，请输入有效文件名。',
      cancelBtn: '取消',
      fileSavedSuccess: '文件已成功保存。',
      fileDeletedSuccess: '文件已删除。',
      currentProject: '当前项目：',
      switchProjectInSettings: '在设置中切换项目',
    },
    discardModal: {
      title: '确定放弃未保存的表单？',
      description: '本页面有未保存或已填写的表单内容。若现在离开，这些修改将会丢失。您确定要继续吗？',
      discardBtn: '放弃并离开',
      cancelBtn: '取消',
    },
    help: {
      title: '帮助与快捷键',
      shortcuts: '键盘快捷键',
      generateShortcut: '生成邮件草稿（工作区）',
      copyShortcut: '复制草稿至剪贴板',
      folderStructure: '配置目录结构',
      folderDesc: '所有配置均存储在本地 "assistant-settings" 目录中，内含 /profiles/<名称>/.env 与 /projects/<名称>/(instructions, templates, signatures)。',
      envFile: '配置文件 .env 格式',
      envDesc: '每个配置文件文件夹均包含独立的 .env 文件：',
      copy: '复制',
      copied: '已复制！',
    },
    about: {
      title: '关于',
      description: '支持离线运行的 AI 邮件草稿助手，具备独立的多配置文件与多项目配置管理功能。',
      version: '版本',
      license: '许可证',
      developer: '开发者',
      sourceCode: '源代码',
      pullRequest: 'Pull request (合并请求)',
      feedback: '建议',
    },
  },
};
