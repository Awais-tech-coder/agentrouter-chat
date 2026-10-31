export const mockModels = [
  { id: "gpt-5.6", name: "GPT-5.6", provider: "OpenAI" },
  { id: "gpt-5.6-sol", name: "GPT-5.6 Sol", provider: "OpenAI" },
  { id: "gpt-5.5", name: "GPT-5.5", provider: "OpenAI" },
  { id: "gpt-4.1", name: "GPT-4.1", provider: "OpenAI" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
];

export type ModelOption = (typeof mockModels)[number];
