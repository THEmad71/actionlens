// lib/extract.ts — Deterministic heuristic extractor.
// Pure function. No network. Runs on client OR server. O(n) on input length.

import type { Extracted, ActionItem, RiskItem } from "./types";
import {
  ACTION_TRIGGERS,
  DUE_PATTERNS,
  OWNER_KEYWORDS,
  RISK_TRIGGERS,
  OBLIGATION_TRIGGERS,
} from "./constants";
import { inferPriority, inferSeverity } from "./priority";

// ── Utilities ──────────────────────────────────────────
const EMPTY_RESULT: Extracted = {
  actions: [],
  obligations: [],
  risks: [],
  questions: [],
  summary: [],
};

function splitSentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function splitBullets(text: string): string[] {
  // First treat explicit bullets
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter((l) => /^([-*•·]|\d+[.)])\s+/.test(l));
  if (bulletLines.length >= 2) {
    return bulletLines.map((l) => l.replace(/^([-*•·]|\d+[.)])\s+/, "").trim());
  }
  return splitSentences(text);
}

function containsAny(haystack: string, needles: readonly string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n));
}

function extractOwner(sentence: string): string | null {
  const s = sentence.toLowerCase();
  for (const kw of OWNER_KEYWORDS) {
    const re = new RegExp(`\\b([a-z][\\w /&-]{0,40}\\b${kw}\\b)`, "i");
    const m = s.match(re);
    if (m) {
      const raw = m[1].trim();
      return raw
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }
  return null;
}

function extractDue(sentence: string): string | null {
  for (const re of DUE_PATTERNS) {
    const m = sentence.match(re);
    if (m) return m[0].trim();
  }
  return null;
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function isActionSentence(s: string): boolean {
  return containsAny(s, ACTION_TRIGGERS);
}

function isRiskSentence(s: string): boolean {
  return containsAny(s, RISK_TRIGGERS);
}

function isQuestionSentence(s: string): boolean {
  return s.includes("?");
}

function isObligationSentence(s: string): boolean {
  return containsAny(s, OBLIGATION_TRIGGERS) && !isActionSentence(s);
}

function firstNonEmpty<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[0] : null;
}

// ── Public API ─────────────────────────────────────────
export function extractHeuristic(input: string): Extracted {
  if (!input || input.trim().length === 0) return EMPTY_RESULT;

  const sentences = splitBullets(input);

  const actionsMap = new Map<string, ActionItem>();
  const obligationsSet = new Set<string>();
  const risksMap = new Map<string, RiskItem>();
  const questionsSet = new Set<string>();

  for (const s of sentences) {
    const cleaned = s.replace(/\s+/g, " ").trim();
    if (!cleaned) continue;

    if (isActionSentence(cleaned)) {
      const key = cleaned.toLowerCase();
      if (!actionsMap.has(key)) {
        actionsMap.set(key, {
          action: cleaned,
          owner: extractOwner(cleaned),
          due: extractDue(cleaned),
          priority: inferPriority(cleaned),
        });
      }
    } else if (isObligationSentence(cleaned)) {
      obligationsSet.add(cleaned);
    }

    if (isRiskSentence(cleaned)) {
      const key = cleaned.toLowerCase();
      if (!risksMap.has(key)) {
        risksMap.set(key, { text: cleaned, severity: inferSeverity(cleaned) });
      }
    }

    if (isQuestionSentence(cleaned)) {
      questionsSet.add(cleaned);
    }
  }

  // Fallback obligations from actions (every action implies an obligation)
  for (const a of actionsMap.values()) {
    obligationsSet.add(a.action);
  }

  const actions = Array.from(actionsMap.values()).slice(0, 50);
  const obligations = dedupe(Array.from(obligationsSet)).slice(0, 30);
  const risks = Array.from(risksMap.values()).slice(0, 30);
  const questions = dedupe(Array.from(questionsSet)).slice(0, 20);

  // Summary = up to 5 lines: first action, top risks, top questions
  const summary: string[] = [];
  if (actions[0]) summary.push(`Top action: ${actions[0].action}`);
  const topRisk = firstNonEmpty(risks);
  if (topRisk) summary.push(`Top risk: ${topRisk.text}`);
  if (actions.length > 1) summary.push(`${actions.length} action items identified.`);
  if (risks.length > 1) summary.push(`${risks.length} risks flagged.`);
  if (questions.length > 0) summary.push(`${questions.length} open question(s) to clarify.`);

  return {
    actions,
    obligations,
    risks,
    questions,
    summary: summary.slice(0, 5),
  };
}
