// lib/llm.ts — Calls the AI route and validates the response with Zod.
import type { Extracted } from "./types";
import { ExtractedSchema } from "./schema";

export type ExtractResponse =
  | { ok: true; data: Extracted; source: "ai" | "heuristic" }
  | { ok: false; error: string };

export async function extractViaApi(
  input: string,
  signal?: AbortSignal
): Promise<ExtractResponse> {
  try {
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
      signal,
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      data?: unknown;
      error?: string;
    };
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? `Request failed (${res.status})` };
    }
    const parsed = ExtractedSchema.safeParse(json.data);
    if (!parsed.success) {
      return { ok: false, error: `Invalid AI response: ${parsed.error.message}` };
    }
    return { ok: true, data: parsed.data, source: "ai" };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
