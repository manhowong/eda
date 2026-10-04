# Email AI Reply Assistant

A client-side, offline-first email drafting and reply assistant powered by modern LLMs (Gemini, OpenAI, OpenRouter) with local template and signature management.

---

## Architecture & Project Structure

```
├── public/                 # Static assets, PWA manifests, and feather favicon (icon.svg)
├── src/
│   ├── components/         # Reusable UI components:
│   │   ├── Banner.tsx             # Standardized inline warning/info/error/success banners
│   │   ├── Modal.tsx              # Accessible dialogs for confirmations & form protection
│   │   ├── Sidebar.tsx            # Sticky desktop / collapsible mobile navigation & status
│   │   └── ToastContainer.tsx     # Unified bottom-right notifications & PWA update prompts
│   ├── hooks/              # Custom React hooks:
│   │   ├── useOnlineStatus.ts     # Real-time network connectivity detector
│   │   └── usePWAInstall.ts       # Browser PWA installation prompt lifecycle hook
│   ├── i18n/               # Localization dictionaries:
│   │   └── translations.ts        # Fully localized strings (en, zh-TW, zh-CN)
│   ├── pages/              # Primary view pages:
│   │   ├── WorkspacePage.tsx      # Drafting workbench (context, key points, tones, generation)
│   │   ├── SettingsPage.tsx       # Profiles (.env), projects (instructions), API keys, duplication
│   │   ├── TemplatesPage.tsx      # Markdown templates and email signatures manager
│   │   ├── HelpPage.tsx           # Keyboard shortcuts, folder layout guide, and .env reference
│   │   └── AboutPage.tsx          # System information, versioning, and license details
│   ├── services/           # Core domain services:
│   │   ├── promptConfig.ts        # Centralized system prompts, response formats, and prompt builders
│   │   ├── llm.ts                 # Unified client-side LLM caller (Gemini, OpenAI, OpenRouter)
│   │   ├── fileSystem.ts          # File System Access API integration for local folder sync
│   │   ├── folderStorage.ts       # IndexedDB storage for remembering active folder handles
│   │   └── defaultWorkspaceData.ts# Default starter templates, signatures, and instructions
│   ├── types/              # Global TypeScript declarations and interfaces:
│   │   ├── filesystem.d.ts        # File System Access API ambient typings
│   │   └── index.ts               # State, profile, project, and drafting interfaces
│   ├── base.css            # Design tokens, color system, and typography
│   ├── main.css            # Component and utility styling
│   ├── responsive.css      # Scoped mobile and tablet responsive layouts (<= 768px)
│   └── index.css           # Global stylesheet entry point
├── index.html              # HTML entry point with metadata, icons, and viewport configuration
├── package.json            # Project dependencies and npm scripts
├── tsconfig.json           # TypeScript compiler configuration
└── vite.config.ts          # Vite build pipeline and PWA plugin configuration
```

---

## Key Design Principles

1. **Client-Side & Offline-First**:
   - Templates, signatures, and API keys are stored client-side in browser storage or synced directly to a user-selected local folder (`assistant-settings/`) via the File System Access API.
2. **Centralized LLM Configurations (`promptConfig.ts`)**:
   - System prompts, response format constraints, and prompt assembly (`buildDraftPrompt`) are centralized in a single file for simple tuning and customization.
3. **Multi-Profile & Multi-Project Isolation**:
   - **Profiles**: Isolated API credentials stored in `.env` files per profile (supporting Gemini, OpenAI, and OpenRouter).
   - **Projects**: Isolated instructions (`instructions.md`), templates (`templates/*.md`), and signatures (`signatures/*.md`). Full duplication replicates all instructions, templates, and signatures into the new project.
4. **Dual Drafting & Refinement**:
   - Supports drafting emails from scratch based on key points, replying to existing email threads, or synthesizing both with customizable tones (Concise, Formal, Friendly & Warm, Polite Refusal).
5. **Clean CSS Architecture**:
   - CSS variables in `base.css`, component classes in `main.css`, and mobile-responsive rules strictly encapsulated in `responsive.css`.

---

## Local Development

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (or bun / pnpm)

### Setup & Run

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables (optional):**
   ```bash
   cp .env.example .env
   ```
   *(API keys can also be configured directly in the app's Settings page.)*

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   The app will run locally at `http://localhost:3000`.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Type checking & linting:**
   ```bash
   npm run lint
   ```
