// lib/priority.ts
import type { Priority, Severity } from "./types";
import { HIGH_PRIORITY_TRIGGERS, LOW_PRIORITY_TRIGGERS } from "./constants";

/**
 * Infer priority for an action sentence.
 *  - High when sentence contains a high-impact trigger AND
 *    (a) a hard deadline phrase, or (b) a security/consequence term.
 *  - Low when sentence reads as a soft suggestion / guideline.
 *  - Otherwise Medium.
 */
export function inferPriority(text: string): Priority {
  const lower = text.toLowerCase();
  const hasHigh = HIGH_PRIORITY_TRIGGERS.some((k) => lower.includes(k));
  const hasLow = LOW_PRIORITY_TRIGGERS.some((k) => lower.includes(k));
  const hasDeadline = /\b(within|by|no later than|immediately|asap|before|after|every)\b/i.test(text);

  if (hasLow && !hasHigh) return "low";
  if (
    hasHigh &&
    (hasDeadline ||
      /\b(security|breach|incident|compromise|outage|downtime|penalty|fine|lawsuit)\b/i.test(lower))
  ) {
    return "high";
  }
  if (hasHigh) return "high";
  return "medium";
}

/** Severity for a risk bullet. Mirrors priority logic but is independent. */
export function inferSeverity(text: string): Severity {
  const lower = text.toLowerCase();
  if (/\b(critical|severe|catastrophic|immediate|breach|ransomware|lawsuit|regulator|audit finding)\b/i.test(lower)) {
    return "high";
  }
  if (/\b(moderate|potential|possible|may|minor|small)\b/i.test(lower)) {
    return "low";
  }
  return "medium";
}
