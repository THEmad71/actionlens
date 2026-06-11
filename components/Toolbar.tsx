// components/Toolbar.tsx
import type { Extracted } from "@/lib/types";

type Props = {
  onExample: () => void;
  onClear: () => void;
  onCopy: () => void;
  onDownload: () => void;
  result: Extracted | null;
  loading: boolean;
};

export default function Toolbar({ onExample, onClear, onCopy, onDownload, result, loading }: Props) {
  const disabled = !result;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onExample}
        className="px-3 py-1.5 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 transition"
      >
        ✨ Example
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-3 py-1.5 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 transition"
      >
        🗑️ Clear
      </button>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onCopy}
          disabled={disabled || loading}
          className="px-3 py-1.5 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📋 Copy Markdown
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={disabled || loading}
          className="px-3 py-1.5 text-sm rounded-md bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬇️ Download .md
        </button>
      </div>
    </div>
  );
}
