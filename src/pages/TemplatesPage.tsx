import React, { useState, useEffect, useRef } from 'react';
import { WorkspaceState, WorkspaceFile } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';
import { Pencil, Copy, Upload, PenLine } from 'lucide-react';
import { Banner } from '../components/Banner';
import { SearchInput } from '../components/SearchInput';
import { useTimedFlag, useTimedValue } from '../hooks/useTimedFlag';
import { useFormDirtyGuard } from '../hooks/useFormDirtyGuard';
import { sanitizeFileName, stripFileExtension } from '../utils/sanitize';

/**
 * Props for TemplatesPage component
 */
interface TemplatesPageProps {
  workspace: WorkspaceState;
  language: SupportedLanguage;
  onSaveFile: (subfolder: 'templates' | 'signatures', filename: string, content: string, oldFilename?: string | null) => Promise<void>;
  onDeleteFile: (subfolder: 'templates' | 'signatures', filename: string) => Promise<void>;
  onNavigateToSettings: () => void;
  onRegisterDirtyCheck: (page: 'templates', checker: (() => boolean) | null) => void;
  initialSubfolder?: 'templates' | 'signatures';
}

/**
 * TemplatesPage: Markdown template and signature manager.
 * Stores `.md` files scoped under the active project in the user's local directory.
 */
export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  workspace,
  language,
  onSaveFile,
  onDeleteFile,
  onNavigateToSettings,
  onRegisterDirtyCheck,
  initialSubfolder,
}) => {
  const t = TRANSLATIONS[language].templates;
  const commonT = TRANSLATIONS[language].common;

  const [subfolder, setSubfolder] = useState<'templates' | 'signatures'>(initialSubfolder || 'templates');

  useEffect(() => {
    if (initialSubfolder && initialSubfolder !== subfolder) {
      setSubfolder(initialSubfolder);
      setIsCreatingNew(false);
      setIsEditingFileName(false);
    }
  }, [initialSubfolder]);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isEditingFileName, setIsEditingFileName] = useState<boolean>(false);
  const [fileNameInput, setFileNameInput] = useState<string>('');
  const [editorContent, setEditorContent] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, triggerSaveSuccess] = useTimedFlag(2000);
  const [error, setError] = useState<string | null>(null);
  const [nameWarning, setNameWarning] = useState<string | null>(null);
  const [confirmDeleteFile, setConfirmDeleteFile, resetConfirmDeleteFile] = useTimedValue<string | null>(null, 3000);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importSuccess, triggerImportSuccess] = useTimedFlag(2000);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingImportedNameRef = useRef<string | null>(null);

  const currentFiles = subfolder === 'templates' ? workspace.templates : workspace.signatures;

  const filteredFiles = currentFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFile = currentFiles.find((f) => f.name === selectedFileName) || currentFiles[0] || null;

  // Register dirty check
  useFormDirtyGuard(
    'templates',
    () => {
      if (isCreatingNew) {
        return Boolean(newFileName.trim());
      }
      if (isEditingFileName) {
        const cleanInput = sanitizeFileName(fileNameInput);
        return cleanInput !== selectedFileName;
      }
      if (activeFile) {
        return editorContent !== activeFile.content;
      }
      return false;
    },
    onRegisterDirtyCheck,
    [isCreatingNew, newFileName, isEditingFileName, fileNameInput, selectedFileName, activeFile, editorContent]
  );

  useEffect(() => {
    // After an import, workspace refresh is async. If we are waiting for the
    // freshly imported file to appear, don't let the sync effect fall back to
    // currentFiles[0] and overwrite the optimistic editor content.
    const pendingName = pendingImportedNameRef.current;
    if (pendingName && !isCreatingNew && !isEditingFileName) {
      const pendingFile = currentFiles.find((f) => f.name === pendingName);
      if (pendingFile) {
        // Workspace now contains the imported file — lock onto it.
        pendingImportedNameRef.current = null;
        setSelectedFileName(pendingFile.name);
        setFileNameInput(stripFileExtension(pendingFile.name));
        setEditorContent(pendingFile.content);
        return;
      }
      // Still waiting for refresh — but if the user picked yet another file
      // manually, pendingImportedNameRef would have been cleared.
      if (selectedFileName === pendingName) return;
    }
    if (activeFile && !isCreatingNew && !isEditingFileName) {
      setSelectedFileName(activeFile.name);
      setFileNameInput(stripFileExtension(activeFile.name));
      setEditorContent(activeFile.content);
    } else if (currentFiles.length === 0 && !isCreatingNew) {
      setSelectedFileName('');
      setFileNameInput('');
      setEditorContent('');
    }
  }, [activeFile?.name, subfolder, isCreatingNew, isEditingFileName, currentFiles.length]);

  const handleSelectFile = (file: WorkspaceFile) => {
    setIsCreatingNew(false);
    setIsEditingFileName(false);
    pendingImportedNameRef.current = null;
    setSelectedFileName(file.name);
    setFileNameInput(stripFileExtension(file.name));
    setEditorContent(file.content);
    setError(null);
    setNameWarning(null);
    resetConfirmDeleteFile();
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setIsEditingFileName(false);
    pendingImportedNameRef.current = null;
    setNewFileName('');
    setFileNameInput('');
    setEditorContent(
      subfolder === 'templates'
        ? `Hi [Name],\n\n[Body text here]\n\nBest regards,\n`
        : `--\n[Your Name]\n[Title] | [Company]\n[Contact Info]`
    );
    setError(null);
    setNameWarning(null);
    resetConfirmDeleteFile();
  };

  const handleTriggerImport = () => {
    if (!canSaveToDisk || isImporting) return;
    setError(null);
    fileInputRef.current?.click();
  };

  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Copy the FileList FIRST: resetting input.value clears the live FileList.
    const pickedFiles = e.target.files ? Array.from(e.target.files) : [];
    // Reset the input so the same file(s) can be selected again later.
    e.target.value = '';
    if (pickedFiles.length === 0) return;
    if (!workspace.hasSettingsFolder) {
      setError(t.noFolderWarning);
      return;
    }
    if (!workspace.activeProjectName) {
      setError(t.noProjectWarning);
      return;
    }
    setIsImporting(true);
    setError(null);
    let importedCount = 0;
    let lastImportedName: string | null = null;
    let lastImportedContent = '';
    try {
      for (const file of pickedFiles) {
        const rawName = file.name;
        const isMarkdown =
          rawName.toLowerCase().endsWith('.md') ||
          rawName.toLowerCase().endsWith('.markdown') ||
          rawName.toLowerCase().endsWith('.txt') ||
          file.type === 'text/markdown' ||
          file.type.startsWith('text/') ||
          // Some browsers report empty type for .md files — accept by content attempt.
          file.type === '' ||
          file.type === 'application/octet-stream';
        if (!isMarkdown) continue;
        const content = await file.text();
        const cleanName = sanitizeFileName(rawName);
        if (!cleanName) continue;
        await onSaveFile(subfolder, cleanName, content, null);
        importedCount += 1;
        lastImportedName = cleanName;
        lastImportedContent = content;
      }
      if (importedCount === 0) {
        setError(t.importError);
      } else {
        // Workspace reload is async: remember the name and let the sync
        // effect below select it once workspace contains the new file.
        // Also optimistically update the editor so feedback is instant.
        if (lastImportedName) {
          pendingImportedNameRef.current = lastImportedName;
          setIsCreatingNew(false);
          setIsEditingFileName(false);
          setSelectedFileName(lastImportedName);
          setFileNameInput(stripFileExtension(lastImportedName));
          setEditorContent(lastImportedContent);
        }
        triggerImportSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsImporting(false);
    }
  };

  const handleDuplicateFile = () => {
    if (!selectedFileName) return;
    setIsCreatingNew(true);
    setIsEditingFileName(false);
    setNewFileName('');
    setFileNameInput('');
    setError(null);
    setNameWarning(null);
    resetConfirmDeleteFile();
  };

  const canSaveToDisk = workspace.hasSettingsFolder && Boolean(workspace.activeProjectName);
  
  const handleSave = async () => {
    if (!workspace.hasSettingsFolder) {
      setError(t.noFolderWarning);
      return;
    }
    if (!workspace.activeProjectName) {
      setError(t.noProjectWarning);
      return;
    }

    setError(null);
    const targetName = isCreatingNew
      ? newFileName.trim()
      : isEditingFileName
      ? fileNameInput.trim()
      : selectedFileName;

    if (!targetName) {
      setNameWarning(t.emptyNameWarning);
      return;
    }

    const cleanName = sanitizeFileName(targetName);
    const oldName = isCreatingNew ? null : selectedFileName;

    setIsSaving(true);
    try {
      await onSaveFile(subfolder, cleanName, editorContent, oldName);
      setIsCreatingNew(false);
      setIsEditingFileName(false);
      setSelectedFileName(cleanName);
      setFileNameInput(stripFileExtension(cleanName));
      triggerSaveSuccess();
      setNameWarning(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!canSaveToDisk) return;
    if (confirmDeleteFile !== filename) {
      setConfirmDeleteFile(filename);
      return;
    }
    setError(null);
    try {
      await onDeleteFile(subfolder, filename);
      resetConfirmDeleteFile();
      if (selectedFileName === filename) {
        setSelectedFileName('');
        setEditorContent('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="page-container-wide space-y-4">
      {/* Header */}
      <div>
        <h1 className="page-title">{t.title}</h1>
      </div>

      {/* Top Section Card: Current Project (only shown when a settings folder is set up) */}
      {workspace.hasSettingsFolder && (
        <div className="section-card-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="text-sm text-neutral-800 flex items-center min-h-[38px]">
            {t.currentProject} <strong className="ml-1.5">{workspace.activeProjectName || TRANSLATIONS[language].status.none}</strong>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto sm:!mt-0">
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="btn-secondary"
            >
              {t.switchProjectInSettings}
            </button>
          </div>
        </div>
      )}

      {/* Warning Box 1: No settings folder connected */}
      {!workspace.hasSettingsFolder && (
        <Banner
          variant="warning"
          action={{ label: t.goToSettings, onClick: onNavigateToSettings }}
        >
          {t.noFolderWarning}
        </Banner>
      )}

      {/* Warning Box 2: Settings folder exists but no project */}
      {workspace.hasSettingsFolder && !workspace.activeProjectName && (
        <Banner
          variant="warning"
          action={{ label: t.goToSettings, onClick: onNavigateToSettings }}
        >
          {t.noProjectWarning}
        </Banner>
      )}

      {/* Warning Box: Empty Name field warning banner */}
      {nameWarning && (
        <Banner
          variant="warning"
          onDismiss={() => setNameWarning(null)}
        >
          {nameWarning}
        </Banner>
      )}

      {error && (
        <Banner
          variant="error"
          onDismiss={() => setError(null)}
        >
          {error}
        </Banner>
      )}

      {/* Two Column Layout: File List + Markdown Editor */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: File List */}
        <div className="md:col-span-4 section-card-sm space-y-2">
          {/* Segmented Group Toggle */}
          <div className="segmented-group w-full h-9 flex">
            <button
              type="button"
              onClick={() => {
                setSubfolder('templates');
                setIsCreatingNew(false);
                setIsEditingFileName(false);
                pendingImportedNameRef.current = null;
              }}
              className={`flex-1 ${subfolder === 'templates' ? 'segmented-btn-active' : 'segmented-btn'}`}
            >
              {t.templatesTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setSubfolder('signatures');
                setIsCreatingNew(false);
                setIsEditingFileName(false);
                pendingImportedNameRef.current = null;
              }}
              className={`flex-1 ${subfolder === 'signatures' ? 'segmented-btn-active' : 'segmented-btn'}`}
            >
              {t.signaturesTab}
            </button>
          </div>

          {/* Search box */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.searchPlaceholder}
          />

          {/* Import + Write actions */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            multiple
            className="hidden"
            onChange={handleImportFiles}
          />
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleStartCreateNew}
              disabled={!canSaveToDisk || isImporting}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm border border-dashed border-neutral-300 text-neutral-600 hover:text-neutral-950 hover:border-neutral-400 hover:bg-neutral-50 transition cursor-pointer ${
                !canSaveToDisk || isImporting ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <PenLine className="w-4 h-4 shrink-0" />
              <span>{t.writeNewFile}</span>
            </button>
            <button
              type="button"
              onClick={handleTriggerImport}
              disabled={!canSaveToDisk || isImporting}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm border border-dashed border-neutral-300 text-neutral-600 hover:text-neutral-950 hover:border-neutral-400 hover:bg-neutral-50 transition cursor-pointer ${
                !canSaveToDisk || isImporting ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>{isImporting ? t.importing : importSuccess ? t.importSuccess : t.importBtn}</span>
            </button>
          </div>

          {/* List */}
          <div className="space-y-1 max-h-[460px] overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">
                {t.noFilesFound}
              </p>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = !isCreatingNew && selectedFileName === file.name;
                return (
                  <div
                    key={file.name}
                    onClick={() => handleSelectFile(file)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-200 text-neutral-950 font-medium'
                        : 'hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <span className="truncate">{file.name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Markdown Editor */}
        <div
          className={`md:col-span-8 section-card space-y-2 transition-opacity duration-200 ${
            !workspace.hasSettingsFolder
              ? 'opacity-40 pointer-events-none select-none'
              : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            {isCreatingNew || isEditingFileName ? (
              <div className="relative flex items-center w-full max-w-sm">
                <input
                  type="text"
                  value={isCreatingNew ? newFileName : fileNameInput}
                  onChange={(e) => {
                    if (isCreatingNew) {
                      setNewFileName(e.target.value);
                    } else {
                      setFileNameInput(e.target.value);
                    }
                  }}
                  disabled={!workspace.hasSettingsFolder}
                  placeholder={t.filename}
                  className="form-input text-sm font-mono h-9 pl-2.5 pr-16 w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && !isCreatingNew) {
                      setFileNameInput(selectedFileName.replace(/\.md$/, ''));
                      setIsEditingFileName(false);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setIsEditingFileName(false);
                    setNameWarning(null);
                    if (selectedFileName) {
                      const file = (subfolder === 'templates' ? workspace.templates : workspace.signatures)
                        .find((f) => f.name === selectedFileName);
                      if (file) {
                        setEditorContent(file.content);
                        setFileNameInput(file.name.replace(/\.md$/, ''));
                      }
                    }
                  }}
                  className="absolute right-2.5 text-xs text-neutral-400 hover:text-neutral-700 font-medium cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h3 className="text-sm font-semibold text-neutral-900 font-mono truncate">
                  {selectedFileName ? selectedFileName.replace(/\.md$/, '') : t.noFileSelected}
                </h3>
                {selectedFileName && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFileNameInput(selectedFileName.replace(/\.md$/, ''));
                        setIsEditingFileName(true);
                      }}
                      disabled={!workspace.hasSettingsFolder}
                      title={t.editFileNameTooltip}
                      className="p-1 rounded hover:bg-neutral-200 transition cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDuplicateFile}
                      disabled={!workspace.hasSettingsFolder}
                      title={t.duplicateFileTooltip}
                      className="p-1 rounded hover:bg-neutral-200 transition cursor-pointer text-neutral-600 hover:text-neutral-900"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              {!isCreatingNew && !isEditingFileName && selectedFileName && (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedFileName)}
                  disabled={!workspace.hasSettingsFolder || !canSaveToDisk}
                  className={confirmDeleteFile === selectedFileName ? 'btn-danger-solid' : 'btn-danger-outline'}
                >
                  {confirmDeleteFile === selectedFileName
                    ? t.deleteConfirm
                    : t.deleteBtn}
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={!workspace.hasSettingsFolder || isSaving || (!selectedFileName && !isCreatingNew)}
                className={`btn-primary ${(!canSaveToDisk || !workspace.hasSettingsFolder) ? 'opacity-60' : ''}`}
                title={!workspace.hasSettingsFolder ? t.noFolderWarning : !canSaveToDisk ? t.noProjectWarning : undefined}
              >
                {isSaving ? commonT.saving : saveSuccess ? commonT.saved : commonT.save}
              </button>
            </div>
          </div>

          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            disabled={!workspace.hasSettingsFolder || (!selectedFileName && !isCreatingNew)}
            rows={18}
            placeholder={
              subfolder === 'templates'
                ? t.templatePlaceholder
                : t.signaturePlaceholder
            }
            className="form-textarea font-mono text-sm leading-relaxed"
          />

          <div className="text-xs text-neutral-400 text-right">
            {editorContent.length} {t.characters}
          </div>
        </div>
      </div>
    </div>
  );
};
