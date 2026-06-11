// lib/schema.ts — Zod schema (single source of truth) + TS types
import { z } from "zod";

// ── Enums ──────────────────────────────────────────────
export const PriorityEnum = z.enum(["low", "medium", "high", "urgent"]);
export const SeverityEnum = z.enum(["low", "medium", "high"]);

// ── Action item ────────────────────────────────────────
export const ActionItemSchema = z.object({
  action: z.string().min(1),
  owner: z.string().nullable(),
  due: z.string().nullable(),
  priority: PriorityEnum,
});
export type ActionItem = z.infer<typeof ActionItemSchema>;

// ── Risk item ──────────────────────────────────────────
export const RiskItemSchema = z.object({
  text: z.string().min(1),
  severity: SeverityEnum,
});
export type RiskItem = z.infer<typeof RiskItemSchema>;

// ── Full extracted result ──────────────────────────────
export const ExtractedSchema = z.object({
  actions: z.array(ActionItemSchema).max(50),
  obligations: z.array(z.string()).max(30),
  risks: z.array(RiskItemSchema).max(30),
  questions: z.array(z.string()).max(20),
  summary: z.array(z.string()).max(5),
});
export type Extracted = z.infer<typeof ExtractedSchema>;

// ── Parse helper (safe) ────────────────────────────────
export function parseExtracted(data: unknown): {
  ok: true;
  data: Extracted;
} {
  const result = ExtractedSchema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  // Fallback: return minimal valid object so UI never breaks
  return {
    ok: true,
    data: {
      actions: [],
      obligations: [],
      risks: [],
      questions: [],
      summary: [],
    },
  };
}
