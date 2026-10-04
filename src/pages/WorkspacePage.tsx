import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorkspaceState } from '../types';
import { generateEmailReply } from '../services/llm';
import { REFINE_PROMPTS, buildDraftPrompt, DEFAULT_SYSTEM_PROMPTS } from '../services/promptConfig';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';
import { Copy, Check, Wand2 } from 'lucide-react';
import { Banner } from '../components/Banner';
import { useClipboard } from '../hooks/useClipboard';
import { useTimedFlag } from '../hooks/useTimedFlag';
import { useFormDirtyGuard } from '../hooks/useFormDirtyGuard';

/**
 * Props for WorkspacePage component
 */
interface WorkspacePageProps {
  workspace: WorkspaceState;
  isOnline: boolean;
  language: SupportedLanguage;
  onNavigateToSettings: () => void;
  onNavigateToTemplates: (subfolder?: 'templates' | 'signatures') => void;
  onRegisterDirtyCheck: (page: 'workspace', checker: (() => boolean) | null) => void;
}

/**
 * WorkspacePage: The primary drafting workbench.
 * Supports incoming thread context, bulleted key points, template/signature insertion,
 * tone selection, and live AI reply generation via configured LLM providers.
 */
export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  workspace,
  isOnline,
  language,
  onNavigateToSettings,
  onNavigateToTemplates,
  onRegisterDirtyCheck,
}) => {
  const t = TRANSLATIONS[language].workspace;
  const commonT = TRANSLATIONS[language].common;
  const refinePrompts = REFINE_PROMPTS[language] || REFINE_PROMPTS.en;

  const [incomingThread, setIncomingThread] = useState<string>('');
  const [keyPoints, setKeyPoints] = useState<string>('');
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
  const [selectedSignatureName, setSelectedSignatureName] = useState<string>('');
  const [selectedToneId, setSelectedToneId] = useState<string>('concise');
  const [generatedReply, setGeneratedReply] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { copy: copyToClipboard, isCopied } = useClipboard(2000);
  const [confirmClear, triggerConfirmClear, resetConfirmClear] = useTimedFlag(3000);

  const draftSectionRef = useRef<HTMLElement>(null);

  // Register dirty check: true if user filled in any form fields
  useFormDirtyGuard(
    'workspace',
    () => Boolean(incomingThread.trim() || keyPoints.trim() || generatedReply.trim() || selectedTemplateName),
    onRegisterDirtyCheck,
    [incomingThread, keyPoints, generatedReply, selectedTemplateName]
  );

  const hasKey = Boolean(workspace.apiKey && workspace.apiKey.trim().length > 0);

  const activeTemplate = workspace.templates.find((tmpl) => tmpl.name === selectedTemplateName);
  const activeSignature = workspace.signatures.find((sig) => sig.name === selectedSignatureName);
  const currentToneData = t.tones[selectedToneId] || t.tones['concise'];

  // Template selection: Selected template will be used as output template in prompt, NOT inserted into input box
  const handleSelectTemplate = (val: string) => {
    if (val === '__create_template__') {
      onNavigateToTemplates('templates');
      return;
    }
    setSelectedTemplateName(val);
  };

  // Signature selection
  const handleSelectSignature = (val: string) => {
    if (val === '__create_signature__') {
      onNavigateToTemplates('signatures');
      return;
    }
    setSelectedSignatureName(val);
  };

  // Append signature
  const handleAppendSignature = () => {
    if (!activeSignature) return;
    setGeneratedReply((prev) => {
      const cleanPrev = prev.trim();
      return cleanPrev ? `${cleanPrev}\n\n${activeSignature.content}` : activeSignature.content;
    });
  };

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!generatedReply) return;
    const ok = await copyToClipboard(generatedReply, 'reply');
    if (!ok) {
      setErrorMessage('Failed to copy to clipboard.');
    }
  }, [generatedReply, copyToClipboard]);

  // Generate reply
  const handleGenerate = useCallback(
    async (overrideInstruction?: string) => {
      setErrorMessage(null);

      if (!isOnline) {
        setErrorMessage(t.offlineWarning);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const hasContent = Boolean(incomingThread.trim() || keyPoints.trim() || activeTemplate?.content?.trim());
      if (!hasContent) {
        return;
      }

      if (!workspace.apiKey || !workspace.apiKey.trim()) {
        setErrorMessage(t.noKeyWarning);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Scroll to generated draft section
      draftSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setIsGenerating(true);
      try {
        const reply = await generateEmailReply({
          apiKey: workspace.apiKey,
          provider: workspace.apiKeyProvider,
          modelName: workspace.modelName,
          systemInstructions: workspace.sessionInstructions,
          incomingThread,
          toneLabel: currentToneData.label,
          toneInstruction: overrideInstruction || currentToneData.instruction,
          keyPoints,
          templateContent: activeTemplate?.content,
          targetLanguage: language,
        });

        let finalReply = reply;
        if (activeSignature && !finalReply.includes(activeSignature.content.trim())) {
          finalReply = `${finalReply}\n\n${activeSignature.content}`;
        }

        setGeneratedReply(finalReply);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : String(err));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setIsGenerating(false);
      }
    },
    [isOnline, incomingThread, workspace, currentToneData, keyPoints, activeTemplate, activeSignature, language, t]
  );

  // Global Keyboard Shortcuts: Ctrl+Enter (generate), Ctrl+S (copy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleCopy();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, handleCopy]);

  // Clear workspace
  const handleClearWorkspace = () => {
    if (!incomingThread && !keyPoints && !generatedReply && !selectedTemplateName && !selectedSignatureName) return;
    if (!confirmClear) {
      triggerConfirmClear();
      return;
    }
    setIncomingThread('');
    setKeyPoints('');
    setGeneratedReply('');
    setSelectedTemplateName('');
    setSelectedSignatureName('');
    setErrorMessage(null);
    resetConfirmClear();
  };

  // Tone options order: Concise, Formal, Friendly & Warm, Polite Refusal
  const toneKeys = ['concise', 'formal', 'friendly-warm', 'polite-refusal'];

  const canGenerate = Boolean(incomingThread.trim() || keyPoints.trim() || activeTemplate?.content?.trim()) && hasKey;
  const canClear = Boolean(incomingThread || keyPoints || generatedReply || selectedTemplateName || selectedSignatureName);
  const canCopyPrompt = Boolean(incomingThread.trim() || keyPoints.trim() || activeTemplate?.content?.trim());

  const handleCopyFinalPrompt = async () => {
    const systemInstruction = workspace.sessionInstructions || DEFAULT_SYSTEM_PROMPTS[language] || DEFAULT_SYSTEM_PROMPTS.en;
    const userPrompt = buildDraftPrompt({
      incomingThread,
      keyPoints,
      toneLabel: currentToneData.label,
      toneInstruction: currentToneData.instruction,
      templateContent: activeTemplate?.content,
      targetLanguage: language,
    });

    const fullPrompt = `${systemInstruction}\n\n---\n\n${userPrompt}`;

    const ok = await copyToClipboard(fullPrompt, 'prompt');
    if (!ok) {
      console.warn('Failed to copy final prompt');
    }
  };

  return (
    <div className="page-container-wide">
      {/* Page Title & Clear Button */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">
          {TRANSLATIONS[language].nav.workspace}
        </h1>

        <button
          type="button"
          onClick={handleClearWorkspace}
          disabled={!canClear || !hasKey}
          className={confirmClear ? 'btn-danger-outline' : 'btn-outline'}
        >
          {confirmClear ? t.clearConfirm : t.clear}
        </button>
      </div>

      {/* Warning Box 1: Runtime Error message if any */}
      {errorMessage && (
        <Banner variant="error" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Banner>
      )}

      {/* Warning Box 2: Unified warning when no API key is provided */}
      {!hasKey && !errorMessage && (
        <Banner
          variant="warning"
          action={{ label: t.goToSettings, onClick: onNavigateToSettings }}
        >
          {t.noKeyWarning}
        </Banner>
      )}

      {/* FORM WRAPPER: Greyed out when no API key is provided */}
      <div className={`space-y-4 transition-opacity duration-200 ${!hasKey ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        {/* INPUT SECTION: Email Content, Key points, Template/Signature, and Tone + Generate */}
        <section className="section-card space-y-4">
          {/* Header Row: Title on Left, Copy Final Prompt on Right */}
          <div className="section-header flex items-center justify-between gap-3 pb-1">
            <h2 className="section-title !mb-0">{t.emailContext}</h2>
            <button
              type="button"
              onClick={handleCopyFinalPrompt}
              disabled={!canCopyPrompt}
              className="btn-outline text-xs inline-flex items-center gap-1.5 shrink-0"
              title={t.copyPromptTooltip}
            >
              {isCopied('prompt') ? (
                <>
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.promptCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.copyPromptBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Two Columns Side by Side with Equal Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Left Column: Key Points Field */}
            <div className="flex flex-col h-full">
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                disabled={!hasKey}
                placeholder={t.keyPointsPlaceholder}
                className="form-textarea flex-1 w-full min-h-[220px] resize-none"
              />
            </div>

            {/* Right Column: Email to Reply Field + Dropdowns */}
            <div className="flex flex-col h-full space-y-3">
              <div className="flex-1 flex flex-col">
                <textarea
                  value={incomingThread}
                  onChange={(e) => setIncomingThread(e.target.value)}
                  disabled={!hasKey}
                  placeholder={t.emailPlaceholder}
                  className="form-textarea flex-1 w-full min-h-[160px] resize-none"
                />
              </div>

              {/* Template & Signature Selector: Templates dropdown on top of Signatures dropdown */}
              <div className="space-y-3">
                {/* Template Selector */}
                <div>
                  <select
                    value={selectedTemplateName}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    disabled={!hasKey}
                    className="form-select"
                  >
                    <option value="">{t.noTemplateSelected}</option>
                    {workspace.templates.map((tmpl) => (
                      <option key={tmpl.name} value={tmpl.name}>
                        {tmpl.name.replace(/\.md$/, '')}
                      </option>
                    ))}
                    <option value="__create_template__">{t.createTemplateDropdown}</option>
                  </select>
                </div>

                {/* Signature Selector */}
                <div>
                  <select
                    value={selectedSignatureName}
                    onChange={(e) => handleSelectSignature(e.target.value)}
                    disabled={!hasKey}
                    className="form-select"
                  >
                    <option value="">{t.noSignatureSelected}</option>
                    {workspace.signatures.map((sig) => (
                      <option key={sig.name} value={sig.name}>
                        {sig.name.replace(/\.md$/, '')}
                      </option>
                    ))}
                    <option value="__create_signature__">{t.createSignatureDropdown}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Row: Tone Options on the Left, Generate Button on the Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mr-1">
                {t.tone}
              </span>
              {toneKeys.map((key) => {
                const tone = t.tones[key];
                const isSelected = selectedToneId === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!hasKey}
                    onClick={() => setSelectedToneId(key)}
                    className={isSelected ? 'btn-chip-active' : 'btn-chip'}
                  >
                    {tone?.label || key}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating || !canGenerate}
              className="btn-primary shrink-0 inline-flex items-center gap-1.5"
            >
              <Wand2 className="w-4 h-4 shrink-0" />
              <span>{isGenerating ? t.generatingBtn : t.generateBtn}</span>
            </button>
          </div>
        </section>

        {/* BOTTOM: Generated Reply */}
        <section ref={draftSectionRef} className="section-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">
              {t.generatedDraft}
            </h2>
          </div>

          <div className="relative rounded-lg bg-white border-2 border-dashed border-neutral-300 focus-within:border-solid focus-within:border-neutral-900 transition-colors shadow-2xs">
            <textarea
              value={generatedReply}
              onChange={(e) => setGeneratedReply(e.target.value)}
              disabled={!hasKey}
              rows={12}
              className="w-full bg-transparent p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-neutral-900 outline-none resize-vertical rounded-lg"
            />
            {!generatedReply && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                <p className="text-sm font-medium text-neutral-400">
                  {t.draftPlaceholder}
                </p>
              </div>
            )}
          </div>

          {/* Row with Refine Buttons and Copy Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{t.refine}</span>
              <button
                type="button"
                disabled={!generatedReply || isGenerating || !hasKey}
                onClick={() => handleGenerate(refinePrompts.shorter)}
                className="btn-outline text-xs"
              >
                {t.shorter}
              </button>
              <button
                type="button"
                disabled={!generatedReply || isGenerating || !hasKey}
                onClick={() => handleGenerate(refinePrompts.moreFormal)}
                className="btn-outline text-xs"
              >
                {t.moreFormal}
              </button>
              <button
                type="button"
                disabled={!generatedReply || isGenerating || !hasKey}
                onClick={() => handleGenerate(refinePrompts.warm)}
                className="btn-outline text-xs"
              >
                {t.warm}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!generatedReply || !hasKey}
              className="btn-primary inline-flex items-center gap-1.5"
            >
              {isCopied('reply') ? (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
