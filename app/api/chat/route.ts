import { NextResponse } from "next/server";
import { callAgentRouter } from "@/lib/agentrouter";

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = body?.prompt || "";
  const model = body?.model || "claude-3-5-sonnet";
  const history = Array.isArray(body?.history) ? body.history : [];

  const finalPrompt = history.length
    ? `${history.map((item: any) => `${item.role}: ${item.content}`).join("\n\n\n")}\n\nuser: ${prompt}`
    : prompt;

  const response = await callAgentRouter({ model, prompt: finalPrompt });

  return NextResponse.json({ text: response });
}
