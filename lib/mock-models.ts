export const mockModels = [
  { id: "claude-opus-4.8", name: "Claude Opus 4.8", provider: "Anthropic" },
  { id: "claude-opus-4.8-vision", name: "Claude Opus 4.8 Vision", provider: "Anthropic" },
  { id: "gpt-5-5", name: "GPT-5.5", provider: "OpenAI" },
  { id: "gpt-5-6-sol", name: "GPT-5.6 Sol", provider: "OpenAI" },
  { id: "glm-5-2", name: "GLM-5.2", provider: "Zhipu" },
  { id: "kimi-k3", name: "Kimi K3", provider: "Moonshot" },
];

export type ModelOption = (typeof mockModels)[number];
