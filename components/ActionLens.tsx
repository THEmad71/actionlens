// components/ActionLens.tsx — Top-level client component.
"use client";

import { useState } from "react";
import InputPanel from "./InputPanel";
import OutputPanel from "./OutputPanel";
import Toolbar from "./Toolbar";
import EmptyState from "./EmptyState";
import { EXAMPLE_TEXT } from "@/lib/example";
import { extractHeuristic } from "@/lib/extract";
import { extractViaApi } from "@/lib/llm";
import { toMarkdown } from "@/lib/markdown";
import type { Extracted } from "@/lib/types";

type Mode = "idle" | "loading" | "done" | "error";

export default function ActionLens() {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<Extracted | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"heuristic" | "ai">("heuristic");

  const analyze = async () => {
    if (!input.trim()) return;
    setMode("loading");
    setError(null);

    // Try AI route first; if it fails or is disabled, fall back to heuristic.
    const ai = await extractViaApi(input);
    if (ai.ok) {
      setResult(ai.data);
      setSource("ai");
      setMode("done");
    } else {
      // Heuristic always works locally
      setResult(extractHeuristic(input));
      setSource("heuristic");
      setMode("done");
      if (ai.error && !ai.error.includes("disabled")) setError(ai.error);
    }
  };

  const onExample = () => {
    setInput(EXAMPLE_TEXT);
    setResult(null);
    setMode("idle");
    setError(null);
  };

  const onClear = () => {
    setInput("");
    setResult(null);
    setMode("idle");
    setError(null);
    try { localStorage.removeItem("actionlens.input.v1"); } catch {}
  };

  const markdown = result ? toMarkdown(result) : "";

  const onCopy = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      // Best-effort fallback
      const ta = document.createElement("textarea");
      ta.value = markdown;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
    }
  };

  const onDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `actionlens-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[40rem] rounded-full bg-indigo-200 blur-3xl" />
          <div className="absolute top-10 right-10 h-40 w-40 rounded-full bg-violet-200 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center shadow-md">
              <span className="text-white text-lg">🧭</span>
            </div>
            <span className="font-semibold tracking-tight text-slate-800">ActionLens</span>
            <span className="ml-2 hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              MVP
            </span>
          </div>
          <h1 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 max-w-3xl">
            Turn dense policy, SOP, and email text into{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              clear actions
            </span>{" "}
            in seconds.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
            Paste any document on the left. Get a checklist of actions, key obligations,
            risks, open questions, and a 5-line summary on the right.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExample}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 transition shadow-sm"
            >
              ✨ Try the example
            </button>
            <a
              href="#app"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 transition"
            >
              Or paste your own ↓
            </a>
          </div>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
            {[
              { t: "Zero setup", d: "No login, no API key required to start." },
              { t: "Private by default", d: "Heuristic mode runs entirely in your browser." },
              { t: "Export-ready", d: "Copy or download a clean Markdown report." },
            ].map((b, i) => (
              <li
                key={i}
                className="rounded-lg border border-slate-200 bg-white/70 backdrop-blur p-3"
              >
                <p className="text-sm font-medium text-slate-800">{b.t}</p>
                <p className="text-xs text-slate-500 mt-0.5">{b.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* App */}
      <main id="app" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/50">
            <Toolbar
              onExample={onExample}
              onClear={onClear}
              onCopy={onCopy}
              onDownload={onDownload}
              result={result}
              loading={mode === "loading"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-slate-200">
            <div className="p-4 sm:p-5">
              <InputPanel
                value={input}
                onChange={setInput}
                onAnalyze={analyze}
                loading={mode === "loading"}
              />
            </div>
            <div className="p-4 sm:p-5 min-h-[60vh]">
              {mode === "loading" ? (
                <EmptyState mode="loading" />
              ) : result ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
                    <span>Source: <span className="font-medium text-slate-700">{source === "ai" ? "AI" : "Heuristic (offline)"}</span></span>
                    {error && (
                      <span title={error} className="text-amber-600">
                        ⚠ AI unavailable, used heuristic
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-h-0">
                    <OutputPanel result={result} />
                  </div>
                </div>
              ) : (
                <EmptyState mode="idle" />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-xs text-slate-500 space-y-2">
          <p>
            <span className="font-semibold text-slate-700">Privacy:</span> by default,
            ActionLens runs entirely in your browser — your text never leaves your device.
            In AI mode, your text is sent to the configured LLM provider over HTTPS.
          </p>
          <p>
            <span className="font-semibold text-slate-700">Limitations:</span> extraction is
            heuristic; review outputs before acting. The tool is an assistant, not a
            substitute for legal, security, or compliance review.
          </p>
        </div>
      </footer>
    </div>
  );
}
