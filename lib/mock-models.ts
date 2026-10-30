export const mockModels = [
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "gpt-4.1", name: "GPT-4.1", provider: "OpenAI" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek" },
];

export type ModelOption = (typeof mockModels)[number];
