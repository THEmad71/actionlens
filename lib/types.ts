// lib/types.ts — Public TS types, inferred from Zod schema.
export type Priority = "low" | "medium" | "high" | "urgent";
export type Severity = "low" | "medium" | "high";

export type { ActionItem, RiskItem, Extracted } from "./schema";
