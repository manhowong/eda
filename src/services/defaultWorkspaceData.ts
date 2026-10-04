import { WorkspaceFile } from '../types';

/* ==========================================================================
   Default Workspace Data & Starter Files
   Separated from fileSystem.ts for modularity and easy customization.
   ========================================================================== */

export const DEFAULT_INSTRUCTIONS = `# Project Instructions: Professional Email Draft Assistant

You are an expert executive communication assistant. Your role is to draft polished, natural, and effective emails—both composing new emails from scratch and replying to incoming messages.

## Core Rules:
1. Versatile Drafting: You can draft new emails based on key points, or reply to existing threads, or synthesize both.
2. Tone & Objective: Strictly reflect the requested tone (e.g., Concise, Formal, Friendly & Warm, Polite Refusal).
3. Directly Address Context: If replying to a thread, answer all questions and acknowledge points made by the sender.
4. Integrate Key Points: Seamlessly weave in all provided key points, dates, instructions, or requirements.
5. No Clichés or Filler: Avoid generic openings like "I hope this email finds you well" unless explicitly requested.
6. Ready-to-Send Format: Output only the body of the email. Do not include subject line labels, markdown quote fences, or commentary unless explicitly instructed.
7. Authentic Human Voice: Ensure the draft sounds natural, confident, and professional.
`;

export const STARTER_TEMPLATES: Record<string, string> = {
  'formal-followup.md': `Hi [Name],

I wanted to follow up on our previous conversation regarding [Topic / Project].

Could you please share any updates on the current status or if there are any pending items needed from my side to help move things forward?

Looking forward to hearing from you.

Best regards,`,
  'meeting-request.md': `Hi [Name],

Thank you for reaching out. I would be glad to connect and discuss [Topic].

Would any of the following times work for a brief 25-minute call?
- [Day, Date] at [Time / Timezone]
- [Day, Date] at [Time / Timezone]

Please let me know which works best for you, or feel free to suggest an alternative time that fits your calendar.

Best regards,`,
  'project-update.md': `Hi [Name / Team],

Here is a quick status update regarding [Project Name]:

• Accomplishments: [Key milestones reached this week]
• In Progress: [Current tasks being finalized]
• Next Steps: [Upcoming deliverables]
• Blockers: [None / List any dependencies]

Please let me know if you have any questions or require additional details.

Best,`,
};

export const STARTER_SIGNATURES: Record<string, string> = {
  'work-formal.md': `--
Jane Doe
Senior Product Manager | Acme Global
jane.doe@example.com | +1 (555) 019-2834
www.acmeglobal.com`,
  'quick-casual.md': `--
Best,
Jane
jane@example.com`,
};

export const STARTER_ENV = `# Email Draft Assistant Configuration
# Provide your Google Gemini, OpenAI, or OpenRouter API Key below:
GEMINI_API_KEY=
# OPENAI_API_KEY=
# OPENROUTER_API_KEY=

# Optional: Specify exact model path/name for your provider:
# GEMINI_MODEL="gemini-2.5-flash"
# OPENAI_MODEL="gpt-4o-mini"
# OPENROUTER_MODEL="openai/gpt-4o-mini"
`;

/**
 * Returns default in-memory templates
 */
export function getDefaultTemplates(): WorkspaceFile[] {
  return Object.entries(STARTER_TEMPLATES).map(([name, content]) => ({
    name,
    content,
    lastModified: Date.now(),
  }));
}

/**
 * Returns default in-memory signatures
 */
export function getDefaultSignatures(): WorkspaceFile[] {
  return Object.entries(STARTER_SIGNATURES).map(([name, content]) => ({
    name,
    content,
    lastModified: Date.now(),
  }));
}
