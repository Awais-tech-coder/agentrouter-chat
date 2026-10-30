import { mockModels, type ModelOption } from "@/lib/mock-models";

const AGENTROUTER_BASE_URL = process.env.AGENTROUTER_BASE_URL || "";
const AGENTROUTER_API_KEY = process.env.AGENTROUTER_API_KEY || "";

export async function getAvailableModels(): Promise<ModelOption[]> {
  if (!AGENTROUTER_BASE_URL || !AGENTROUTER_API_KEY) {
    return mockModels;
  }

  try {
    const res = await fetch(`${AGENTROUTER_BASE_URL.replace(/\/$/, "")}/v1/models`, {
      headers: {
        Authorization: `Bearer ${AGENTROUTER_API_KEY}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return mockModels;
    }

    const data = await res.json();
    if (Array.isArray(data?.data)) {
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        provider: model.provider || "AgentRouter",
      }));
    }

    return mockModels;
  } catch {
    return mockModels;
  }
}

export async function callAgentRouter({
  model,
  prompt,
}: {
  model: string;
  prompt: string;
}): Promise<string> {
  if (!AGENTROUTER_BASE_URL || !AGENTROUTER_API_KEY) {
    return `This is a demo assistant response from the AgentRouter-style chat app.\n\nYou asked: "${prompt}"\n\nModel selected: ${model}.\n\nIn production, this request would be forwarded to your AgentRouter gateway with the selected model.`;
  }

  const candidateUrls = [
    `${AGENTROUTER_BASE_URL.replace(/\/$/, "")}/v1/chat/completions`,
    `${AGENTROUTER_BASE_URL.replace(/\/$/, "")}/chat/completions`,
  ];

  let lastError: unknown;

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AGENTROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        lastError = new Error(`AgentRouter request failed with ${response.status}`);
        continue;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (typeof content === "string") return content;
      const nested = data?.output?.[0]?.content?.[0]?.text;
      if (typeof nested === "string") return nested;

      return "AgentRouter returned a valid response but the format was unexpected.";
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    return `There was an issue connecting to AgentRouter. Please verify your AGENTROUTER_BASE_URL and AGENTROUTER_API_KEY.\n\nFallback reason: ${String(lastError)}`;
  }

  return "AgentRouter connection failed.";
}
