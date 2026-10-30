import { NextResponse } from "next/server";
import { callAgentRouter, getAvailableModels } from "@/lib/agentrouter";

export async function GET() {
  const models = await getAvailableModels();
  return NextResponse.json(models);
}
