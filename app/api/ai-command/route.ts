import { NextResponse } from "next/server";
import { parseMycoCommand } from "@/lib/ai-command";
import type { AppState } from "@/lib/types";

export const runtime = "nodejs";

type RequestBody = {
  message?: string;
  state?: AppState;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const message = body.message?.trim();
  if (!message || !body.state) {
    return NextResponse.json({ error: "Update and current state are required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await parseMycoCommand(message, body.state));
  } catch (error) {
    console.error("AI command error", error);
    const message = error instanceof Error ? error.message : "The update could not be processed";
    const status = message === "OPENAI_API_KEY is not configured" ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
