export const mockModels = [
  { id: "gpt-5.6-sol", name: "gpt-5.6-sol", provider: "OpenAI" },
  { id: "gpt-6-astra", name: "gpt-6-astra", provider: "OpenAI" },
  { id: "gpt-8.1-sol", name: "gpt-8.1-sol", provider: "OpenAI" },
];

export type ModelOption = (typeof mockModels)[number];
