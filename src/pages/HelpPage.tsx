import React from 'react';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';
import { useClipboard } from '../hooks/useClipboard';
import { CodeBlockWithCopy } from '../components/CodeBlockWithCopy';

interface HelpPageProps {
  language: SupportedLanguage;
}

export const HelpPage: React.FC<HelpPageProps> = ({ language }) => {
  const t = TRANSLATIONS[language].help;
  const { copy, isCopied } = useClipboard(2000);

  const folderStructure = `assistant-settings/
├── settings.json         <- Active profile & active project state
├── profiles/
│   ├── work/
│   │   └── .env          <- GEMINI_API_KEY=... / OPENAI_API_KEY=...
│   └── personal/
│       └── .env
└── projects/
    └── sales/
        ├── instructions.md
        ├── templates/    <- Markdown template files (*.md)
        │   └── formal-followup.md
        └── signatures/   <- Markdown signature files (*.md)
            └── work-formal.md`;

  const envSample = `# Profile .env Configuration
GEMINI_API_KEY="AIzaSy..."
# Optional: GEMINI_MODEL="gemini-2.5-flash"

# Or OpenAI:
# OPENAI_API_KEY="sk-..."
# OPENAI_MODEL="gpt-4o"

# Or OpenRouter:
# OPENROUTER_API_KEY="sk-or-..."
# OPENROUTER_MODEL="anthropic/claude-3.5-sonnet"`;

  return (
    <div className="page-container-medium">
      <div>
        <h1 className="page-title">{t.title}</h1>
      </div>

      {/* Keyboard Shortcuts Section */}
      <section className="section-card !space-y-4">
        <h2 className="section-title">{t.shortcuts}</h2>
        <div className="divide-y divide-neutral-100 text-sm">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-700">{t.generateShortcut}</span>
            <span><kbd>Ctrl + Enter</kbd> / <kbd>⌘ + Enter</kbd></span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-700">{t.copyShortcut}</span>
            <span><kbd>Ctrl + S</kbd> / <kbd>⌘ + S</kbd></span>
          </div>
        </div>
      </section>

      {/* Local Folder Structure */}
      <section className="section-card !space-y-3">
        <h2 className="section-title">{t.folderStructure}</h2>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {t.folderDesc}
        </p>

        <CodeBlockWithCopy
          code={folderStructure}
          isCopied={isCopied('structure')}
          onCopy={() => copy(folderStructure, 'structure')}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
      </section>

      {/* Environment File */}
      <section className="section-card !space-y-3">
        <h2 className="section-title">{t.envFile}</h2>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {t.envDesc}
        </p>

        <CodeBlockWithCopy
          code={envSample}
          isCopied={isCopied('env')}
          onCopy={() => copy(envSample, 'env')}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
      </section>
    </div>
  );
};

