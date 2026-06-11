// components/InputPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
  loading: boolean;
};

const STORAGE_KEY = "actionlens.input.v1";

export default function InputPanel({ value, onChange, onAnalyze, loading }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !value) onChange(saved);
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave (debounced) on change
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [value, hydrated]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onAnalyze();
  };

  const chars = value.length;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full gap-3">
      <label htmlFor="src" className="text-sm font-medium text-slate-700">
        Paste your text
      </label>
      <textarea
        id="src"
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        placeholder="Paste a policy, SOP, email, or any text you want to analyze…"
        spellCheck
        className="flex-1 min-h-[60vh] md:min-h-0 w-full resize-none rounded-lg border border-slate-300 bg-white p-4 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
      />
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {chars.toLocaleString()} chars · {words.toLocaleString()} words
          <span className="hidden sm:inline"> · autosaved</span>
        </span>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading || !value.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Analyzing…
            </>
          ) : (
            <>🔍 Analyze</>
          )}
        </button>
      </div>
      <p className="text-[11px] text-slate-400">
        Tip: press <kbd className="px-1 py-0.5 rounded border border-slate-300 bg-white">⌘/Ctrl</kbd>+
        <kbd className="px-1 py-0.5 rounded border border-slate-300 bg-white">Enter</kbd> to analyze.
      </p>
    </div>
  );
}
