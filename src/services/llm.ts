import { SupportedLanguage } from '../i18n/translations';
import {
  DEFAULT_MODELS,
  RECOMMENDED_MODELS,
  GENERATION_CONFIG,
  buildDraftPrompt,
  LLM_ERROR_MESSAGES,
} from './promptConfig';

export { DEFAULT_MODELS, RECOMMENDED_MODELS };

export interface GenerateReplyParams {
  apiKey: string;
  provider?: 'gemini' | 'openai' | 'openrouter' | 'custom' | null;
  modelName?: string;
  systemInstructions: string;
  incomingThread?: string;
  toneLabel?: string;
  toneInstruction?: string;
  keyPoints?: string;
  templateContent?: string;
  targetLanguage?: SupportedLanguage;
}

/**
 * Generate an email draft
 */
export async function generateEmailReply({
  apiKey,
  provider,
  modelName,
  systemInstructions,
  incomingThread,
  toneLabel,
  toneInstruction,
  keyPoints,
  templateContent,
  targetLanguage = 'en',
}: GenerateReplyParams): Promise<string> {
  // Check online status first
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error(LLM_ERROR_MESSAGES.offline);
  }

  if (!apiKey || !apiKey.trim()) {
    throw new Error(LLM_ERROR_MESSAGES.missingKey);
  }

  const cleanKey = apiKey.trim();

  // Detect provider: OpenRouter if key starts with sk-or- or provider is openrouter
  let detectedProvider: 'gemini' | 'openai' | 'openrouter' = 'gemini';
  if (provider === 'openrouter' || cleanKey.startsWith('sk-or-')) {
    detectedProvider = 'openrouter';
  } else if (provider === 'openai' || cleanKey.startsWith('sk-')) {
    detectedProvider = 'openai';
  } else if (provider === 'gemini') {
    detectedProvider = 'gemini';
  }

  // Build the user prompt using the prompt builder
  const promptBody = buildDraftPrompt({
    incomingThread,
    keyPoints,
    toneLabel,
    toneInstruction,
    templateContent,
    targetLanguage,
  });

  if (detectedProvider === 'gemini') {
    return callGeminiAPI(cleanKey, systemInstructions, promptBody, modelName);
  } else if (detectedProvider === 'openrouter') {
    return callOpenRouterAPI(cleanKey, systemInstructions, promptBody, modelName);
  } else {
    return callOpenAIAPI(cleanKey, systemInstructions, promptBody, modelName);
  }
}

async function callGeminiAPI(
  apiKey: string,
  systemInstruction: string,
  prompt: string,
  modelName?: string
): Promise<string> {
  const chosenModel = (modelName?.trim() || DEFAULT_MODELS.gemini).replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(chosenModel)}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: GENERATION_CONFIG.temperature,
      maxOutputTokens: GENERATION_CONFIG.maxOutputTokens,
    },
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error(LLM_ERROR_MESSAGES.offline);
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Network error connecting to Gemini API: ${message}`);
  }

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorJson = await response.json();
      errorDetails = errorJson.error?.message || response.statusText;
    } catch {
      errorDetails = response.statusText;
    }

    if (response.status === 400 && errorDetails.includes('API_KEY_INVALID')) {
      throw new Error(LLM_ERROR_MESSAGES.geminiKeyInvalid);
    } else if (response.status === 429) {
      throw new Error(LLM_ERROR_MESSAGES.quotaExceeded);
    } else {
      throw new Error(`Gemini API error (${response.status}): ${errorDetails}`);
    }
  }

  const data = await response.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error(LLM_ERROR_MESSAGES.emptyOutput);
  }

  return textOutput.trim();
}

async function callOpenAIAPI(
  apiKey: string,
  systemInstruction: string,
  prompt: string,
  modelName?: string
): Promise<string> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const chosenModel = modelName?.trim() || DEFAULT_MODELS.openai;

  const payload = {
    model: chosenModel,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt },
    ],
    temperature: GENERATION_CONFIG.temperature,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error(LLM_ERROR_MESSAGES.offline);
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Network error connecting to OpenAI API: ${message}`);
  }

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorJson = await response.json();
      errorDetails = errorJson.error?.message || response.statusText;
    } catch {
      errorDetails = response.statusText;
    }

    if (response.status === 401) {
      throw new Error(LLM_ERROR_MESSAGES.openaiKeyInvalid);
    } else if (response.status === 429) {
      throw new Error(LLM_ERROR_MESSAGES.quotaExceeded);
    } else {
      throw new Error(`OpenAI API error (${response.status}): ${errorDetails}`);
    }
  }

  const data = await response.json();
  const textOutput = data.choices?.[0]?.message?.content;

  if (!textOutput) {
    throw new Error(LLM_ERROR_MESSAGES.emptyOutput);
  }

  return textOutput.trim();
}

async function callOpenRouterAPI(
  apiKey: string,
  systemInstruction: string,
  prompt: string,
  modelName?: string
): Promise<string> {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const chosenModel = modelName?.trim() || DEFAULT_MODELS.openrouter;

  const payload = {
    model: chosenModel,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt },
    ],
    temperature: GENERATION_CONFIG.temperature,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
        'X-Title': 'AI Email Draft Assistant',
      },
      body: JSON.stringify(payload),
    });
  } catch (err: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error(LLM_ERROR_MESSAGES.offline);
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Network error connecting to OpenRouter API: ${message}`);
  }

  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorJson = await response.json();
      errorDetails = errorJson.error?.message || response.statusText;
    } catch {
      errorDetails = response.statusText;
    }

    if (response.status === 401) {
      throw new Error(LLM_ERROR_MESSAGES.openrouterKeyInvalid);
    } else if (response.status === 429) {
      throw new Error(LLM_ERROR_MESSAGES.quotaExceeded);
    } else {
      throw new Error(`OpenRouter API error (${response.status}): ${errorDetails}`);
    }
  }

  const data = await response.json();
  const textOutput = data.choices?.[0]?.message?.content;

  if (!textOutput) {
    throw new Error(LLM_ERROR_MESSAGES.emptyOutput);
  }

  return textOutput.trim();
}
