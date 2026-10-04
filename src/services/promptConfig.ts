import type { SupportedLanguage } from '../i18n/translations';

/* ==========================================================================
   LLM Prompt & Call Configuration File
   Manages all system prompts, user prompt templates, response formats,
   model configurations, and error messages.
   ========================================================================== */

/**
 * Default models for each supported provider
 */
export const DEFAULT_MODELS: Record<'gemini' | 'openai' | 'openrouter', string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  openrouter: 'openai/gpt-4o-mini',
};

/**
 * Recommended models shown in settings
 */
export const RECOMMENDED_MODELS: Record<'gemini' | 'openai' | 'openrouter', { id: string; label: string; note: string }[]> = {
  gemini: [
    { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', note: 'Fast, multimodal & versatile (Default)' },
    { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro', note: 'Complex reasoning & nuanced drafting' },
    { id: 'gemini-1.5-flash', label: 'gemini-1.5-flash', note: 'High speed & lightweight' },
    { id: 'gemini-1.5-pro', label: 'gemini-1.5-pro', note: 'Deep context analysis' },
  ],
  openai: [
    { id: 'gpt-4o-mini', label: 'gpt-4o-mini', note: 'Fast & cost-efficient (Default)' },
    { id: 'gpt-4o', label: 'gpt-4o', note: 'Flagship omni model for high-stakes drafts' },
    { id: 'o3-mini', label: 'o3-mini', note: 'High efficiency reasoning model' },
    { id: 'gpt-4-turbo', label: 'gpt-4-turbo', note: 'High capability model' },
  ],
  openrouter: [
    { id: 'openai/gpt-4o-mini', label: 'openai/gpt-4o-mini', note: 'OpenAI GPT-4o mini via OpenRouter (Default)' },
    { id: 'anthropic/claude-3.5-sonnet', label: 'anthropic/claude-3.5-sonnet', note: 'Top tier writing & nuance' },
    { id: 'deepseek/deepseek-chat', label: 'deepseek/deepseek-chat', note: 'DeepSeek V3 general chat' },
    { id: 'meta-llama/llama-3.3-70b-instruct', label: 'meta-llama/llama-3.3-70b-instruct', note: 'Meta open weights' },
    { id: 'google/gemini-2.5-flash', label: 'google/gemini-2.5-flash', note: 'Google Gemini via OpenRouter' },
  ],
};

/**
 * Model generation hyperparameters
 */
export const GENERATION_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 2048,
};

/**
 * System Instructions for Email Draft Assistant across supported languages
 */
export const DEFAULT_SYSTEM_PROMPTS: Record<SupportedLanguage, string> = {
  en: `# Project Instructions: Executive Email Draft Assistant

You are an expert executive communication assistant. Your role is to draft polished, natural, and effective emails—both composing new emails from scratch and replying to incoming messages.

## Core Rules:
1. Versatile Drafting: You can draft new emails based on key points, or reply to existing threads, or synthesize both.
2. Tone & Objective: Strictly reflect the requested tone (e.g., Concise, Formal, Friendly & Warm, Polite Refusal).
3. Directly Address Context: If replying to a thread, answer all questions and acknowledge points made by the sender.
4. Integrate Key Points: Seamlessly weave in all provided key points, dates, instructions, or requirements.
5. No Clichés or Filler: Avoid generic openings like "I hope this email finds you well" unless explicitly requested.
6. Ready-to-Send Format: Output only the body of the email. Do not include subject line labels, markdown quote fences, or commentary unless explicitly instructed.
7. Authentic Human Voice: Ensure the draft sounds natural, confident, and professional.`,

  'zh-TW': `# 專案指令：商務電郵草稿專家

您是一位資深的專業商務溝通顧問。您的職責是撰寫典雅得體、條理清晰且切合情境的繁體中文商務郵件草稿—包含從零撰寫新信件以及回覆來信。

## 核心準則：
1. 全方位草擬能力：可根據重點要項直接草擬全新郵件，或針對來信回覆，亦可兩者結合。
2. 語氣與目標：嚴格符合所選語氣（例如：簡潔精練、正式專業、親切溫暖、禮貌婉拒）。
3. 契合情境：若為回覆信件，直接且完整地回應來信中的所有問題與提議。
4. 完美融合重點：將使用者所提供的各項要點、時間與指示自然融入信件中。
5. 措辭精準：採用標準繁體中文商務書信規範（台灣／香港商務用語），避免陳腔濫調與冗贅客套。
6. 隨時可發送：僅輸出郵件正文內容，請勿輸出主旨標籤或多餘的系統註釋。`,

  'zh-CN': `# 项目指令：商务邮件草稿专家

您是一位经验丰富的商务沟通顾问。您的职责是撰写得体、清晰、高效的简体中文商务邮件草稿—既能根据关键要点起草新邮件，也能针对来信撰写专业回复。

## 核心准则：
1. 全方位起草：支持根据提供的要点从零草拟新邮件，或针对既有来信撰写针对性回复。
2. 语气与目标：严格遵循所选语气（例如：简明扼要、正式专业、热情亲和、礼貌谢绝）。
3. 切合上下文：若属于回复邮件，直接且逐项回应来信中的问题、提议与行动项。
4. 整合关键要点：准确、自然地将用户提供的所有要点与时间指示整合进正文中。
5. 现代规范：采用符合现代商务规范的简体中文书写，言简意赅，去除不必要的虚词客套。
6. 即开即用：仅输出邮件正文，无需添加主题行标签或多余元数据。`,
};

/**
 * Language constraints enforcing strict output language
 */
export const LANGUAGE_DIRECTIVES: Record<SupportedLanguage, string> = {
  en: 'LANGUAGE CONSTRAINT: You must write the email draft in natural, professional English.\n\n',
  'zh-TW': 'LANGUAGE CONSTRAINT: You must write the email draft strictly in Traditional Chinese (繁體中文, using standard Taiwanese/Hong Kong business idioms and vocabulary, strictly no Simplified Chinese characters).\n\n',
  'zh-CN': 'LANGUAGE CONSTRAINT: You must write the email draft strictly in Simplified Chinese (规范简体中文商务书写规范与用语).\n\n',
};

/**
 * Global response format constraint by language
 */
export const RESPONSE_FORMAT_CONSTRAINTS: Record<SupportedLanguage, string> = {
  en: 'TASK:\nDraft only the email body. Be authentic, professional, directly address all necessary points, and strictly honor the language constraint. Do not output subject lines or explanation blocks.',
  'zh-TW': '任務要求：\n僅輸出郵件正文。語氣真實自然且專業，逐項切合所有重點，並嚴格遵循指定語言規範。請勿輸出主旨（Subject）標籤、Markdown 引用代碼塊或多餘的解釋說明。',
  'zh-CN': '任务要求：\n仅输出邮件正文。语气自然得体且专业，全面切合所有要点，并严格遵循指定语言规范。请勿输出主题（Subject）标签、Markdown 代码块或多余的解释说明。',
};

export const RESPONSE_FORMAT_CONSTRAINT = RESPONSE_FORMAT_CONSTRAINTS.en;

/**
 * Prompt labels and mode instructions localized across languages
 */
export const PROMPT_STRINGS: Record<
  SupportedLanguage,
  {
    modeReplyWithKeyPoints: string;
    modeReply: string;
    modeCompose: string;
    modeTemplate: string;
    modeDefault: string;
    keyPointsHeader: string;
    incomingEmailHeader: string;
    toneGoalHeader: string;
    outputTemplateHeader: string;
    responseFormatConstraint: string;
  }
> = {
  en: {
    modeReplyWithKeyPoints: 'MODE: Reply to an existing email thread while incorporating specific key points.\n\n',
    modeReply: 'MODE: Reply to an incoming email thread.\n\n',
    modeCompose: 'MODE: Compose a new email draft from scratch based on the provided key points.\n\n',
    modeTemplate: 'MODE: Draft an email following the provided output template.\n\n',
    modeDefault: 'MODE: Draft a professional email.\n\n',
    keyPointsHeader: 'KEY POINTS TO INCLUDE & SPECIFIC GUIDANCE:\n',
    incomingEmailHeader: 'INCOMING EMAIL / EMAIL TO REPLY TO:\n',
    toneGoalHeader: 'REQUESTED TONE / GOAL:\n',
    outputTemplateHeader: 'OUTPUT TEMPLATE (You MUST structure and format the final email reply/draft using this template layout, adapting placeholders and details):\n',
    responseFormatConstraint: RESPONSE_FORMAT_CONSTRAINTS.en,
  },
  'zh-TW': {
    modeReplyWithKeyPoints: '任務模式：針對現有來信撰寫回覆，並精準融入指定重點。\n\n',
    modeReply: '任務模式：針對來信內容撰寫專業回覆。\n\n',
    modeCompose: '任務模式：根據提供的要點從零撰寫全新郵件草稿。\n\n',
    modeTemplate: '任務模式：依照所提供的郵件版型撰寫郵件。\n\n',
    modeDefault: '任務模式：撰寫專業商務郵件。\n\n',
    keyPointsHeader: '必須包含的重點要項與指引：\n',
    incomingEmailHeader: '來信內容／待回覆信件：\n',
    toneGoalHeader: '指定語氣／溝通目標：\n',
    outputTemplateHeader: '輸出格式範本（請嚴格遵循此範本之架構與格式排版，並依實際情境置換內容）：\n',
    responseFormatConstraint: RESPONSE_FORMAT_CONSTRAINTS['zh-TW'],
  },
  'zh-CN': {
    modeReplyWithKeyPoints: '任务模式：针对既有来信撰写专业回复，并准确融入指定要点。\n\n',
    modeReply: '任务模式：针对来信内容撰写专业回复。\n\n',
    modeCompose: '任务模式：根据提供的关键要点起草新邮件。\n\n',
    modeTemplate: '任务模式：依照所提供的邮件模板起草邮件。\n\n',
    modeDefault: '任务模式：撰写专业商务邮件。\n\n',
    keyPointsHeader: '必须包含的关键要点与指引：\n',
    incomingEmailHeader: '来信内容／待回复邮件：\n',
    toneGoalHeader: '指定语气／沟通目标：\n',
    outputTemplateHeader: '输出格式模板（请严格遵循此模板的架构与格式排版，并根据实际情况替换内容）：\n',
    responseFormatConstraint: RESPONSE_FORMAT_CONSTRAINTS['zh-CN'],
  },
};

/**
 * Refine instruction prompts across supported languages
 */
export const REFINE_PROMPTS: Record<SupportedLanguage, { shorter: string; moreFormal: string; warm: string }> = {
  en: {
    shorter: 'Make it shorter and more direct.',
    moreFormal: 'Make it more formal.',
    warm: 'Add warmth and gratitude.',
  },
  'zh-TW': {
    shorter: '使其更簡短精煉且直奔主題。',
    moreFormal: '使其語氣更加正式嚴謹與具備高階商務專業度。',
    warm: '增添親切溫暖、同理心與感謝之意。',
  },
  'zh-CN': {
    shorter: '使其更简短精练且直奔主题。',
    moreFormal: '使其语气更加正式严谨与具备专业商务感。',
    warm: '增添亲切温暖、同理心与感谢之意。',
  },
};

/**
 * Parameters for building the email draft prompt
 */
export interface PromptBuilderParams {
  incomingThread?: string;
  keyPoints?: string;
  toneLabel?: string;
  toneInstruction?: string;
  templateContent?: string;
  targetLanguage?: SupportedLanguage;
}

/**
 * Assembles the full user prompt for the LLM based on user inputs
 */
export function buildDraftPrompt({
  incomingThread,
  keyPoints,
  toneLabel,
  toneInstruction,
  templateContent,
  targetLanguage = 'en',
}: PromptBuilderParams): string {
  const languageDirective = LANGUAGE_DIRECTIVES[targetLanguage] || LANGUAGE_DIRECTIVES.en;
  let prompt = languageDirective;

  const strings = PROMPT_STRINGS[targetLanguage] || PROMPT_STRINGS.en;
  const hasThread = Boolean(incomingThread && incomingThread.trim().length > 0);
  const hasKeyPoints = Boolean(keyPoints && keyPoints.trim().length > 0);
  const hasTemplate = Boolean(templateContent && templateContent.trim().length > 0);

  // Intent description
  if (hasThread && hasKeyPoints) {
    prompt += strings.modeReplyWithKeyPoints;
  } else if (hasThread) {
    prompt += strings.modeReply;
  } else if (hasKeyPoints) {
    prompt += strings.modeCompose;
  } else if (hasTemplate) {
    prompt += strings.modeTemplate;
  } else {
    prompt += strings.modeDefault;
  }

  // 1. Key points / specific guidance (First priority if provided)
  if (hasKeyPoints) {
    prompt += `${strings.keyPointsHeader}"""\n${keyPoints?.trim()}\n"""\n\n`;
  }

  // 2. Incoming email context (if replying or providing background)
  if (hasThread) {
    prompt += `${strings.incomingEmailHeader}"""\n${incomingThread?.trim()}\n"""\n\n`;
  }

  // 3. Requested Tone
  if (toneInstruction) {
    prompt += `${strings.toneGoalHeader}${toneLabel ? `[${toneLabel}] ` : ''}${toneInstruction}\n\n`;
  }

  // 4. Output Template Reference (Output template layout to follow)
  if (hasTemplate) {
    prompt += `${strings.outputTemplateHeader}"""\n${templateContent!.trim()}\n"""\n\n`;
  }

  // 5. Output Format Constraint
  prompt += strings.responseFormatConstraint;

  return prompt;
}

/**
 * User-friendly error message resolution
 */
export const LLM_ERROR_MESSAGES = {
  offline: 'Draft generation requires an active internet connection.',
  missingKey: 'Missing API Key. Please configure your API Key in Settings.',
  geminiKeyInvalid: 'Invalid Gemini API Key. Please verify your key in Settings.',
  openaiKeyInvalid: 'Invalid OpenAI API Key. Please verify your key in Settings.',
  openrouterKeyInvalid: 'Invalid OpenRouter API Key. Please verify your key in Settings.',
  quotaExceeded: 'API quota exceeded or rate limit reached. Please check your provider account.',
  emptyOutput: 'No draft was generated by the model. Please check your inputs and try again.',
};
