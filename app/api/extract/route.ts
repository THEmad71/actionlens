// app/api/extract/route.ts — Server route. Activated only when
// the ACTIONLENS_API_KEY env var is set. Otherwise the client
// uses the heuristic extractor and this route is never hit.

import { NextResponse } from "next/server";
import { ExtractedSchema } from "@/lib/schema";
import { extractHeuristic } from "@/lib/extract";
import type { Extracted } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are ActionLens, an expert analyst that extracts structured information from policy, SOP, and email text.
You MUST respond with a single JSON object that exactly matches this TypeScript type (no commentary, no markdown fences):

{
  "actions": Array<{ "action": string; "owner": string|null; "due": string|null; "priority": "low"|"medium"|"high"|"urgent" }>,
  "obligations": string[],
  "risks":     Array<{ "text": string; "severity": "low"|"medium"|"high" }>,
  "questions": string[],
  "summary":   string[]
}

Rules:
- Max 50 actions, 30 obligations, 30 risks, 20 questions, 5 summary lines.
- Extract owners only when explicitly mentioned (IT, Security Team, DPO, etc.).
- Extract due phrases verbatim when present ("within 24 hours", "by Friday 5 PM").
- High/urgent priority for security incidents, strict deadlines, or regulatory exposure.
- If a field is unknown, return null (for action fields) or omit (for arrays).
- Output ONLY the JSON object.`;

interface ChatMessage { role: "system" | "user" | "assistant"; content: string }

async function callOpenAICompatible(
  apiKey: string,
  baseUrl: string,
  model: string,
  messages: ChatMessage[]
): Promise<unknown> {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.1, response_format: { type: "json_object" } }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");
  return JSON.parse(content);
}

export async function POST(req: Request) {
  const apiKey = process.env.ACTIONLENS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "AI mode disabled. Set ACTIONLENS_API_KEY to enable." },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => null)) as { input?: string } | null;
  const input = body?.input?.trim() ?? "";
  if (!input) {
    return NextResponse.json({ ok: false, error: "Empty input." }, { status: 400 });
  }

  const baseUrl = process.env.ACTIONLENS_API_BASE ?? "https://api.openai.com/v1";
  const model = process.env.ACTIONLENS_MODEL ?? "gpt-4o-mini";

  try {
    const raw = await callOpenAICompatible(apiKey, baseUrl, model, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: input },
    ]);
    const parsed = ExtractedSchema.safeParse(raw);
    if (!parsed.success) {
      // Return heuristic as a safe fallback so client never breaks
      const fallback: Extracted = extractHeuristic(input);
      return NextResponse.json(
        { ok: false, error: `Schema mismatch: ${parsed.error.message}`, fallback },
        { status: 200 }
      );
    }
    return NextResponse.json({ ok: true, data: parsed.data });
  } catch (err) {
    const fallback: Extracted = extractHeuristic(input);
    return NextResponse.json(
      { ok: false, error: (err as Error).message, fallback },
      { status: 200 }
    );
  }
}
