// components/EmptyState.tsx
export default function EmptyState({ mode }: { mode: "idle" | "loading" | "error" }) {
  if (mode === "loading") {
    return (
      <div className="space-y-4 p-4 animate-fade-in">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-40 skeleton" />
            <div className="h-3 w-full skeleton" />
            <div className="h-3 w-5/6 skeleton" />
            <div className="h-3 w-4/6 skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center shadow-lg shadow-indigo-200">
        <span className="text-2xl">🧭</span>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-800">No analysis yet</h2>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        Paste a policy, SOP, or email on the left and click <span className="font-medium text-slate-700">Analyze</span>.
        Or hit <span className="font-medium text-slate-700">Try the example</span> to see how it works.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-slate-500 max-w-md">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">✅ Action items</div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">⚠️ Risks</div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">❓ Questions</div>
      </div>
    </div>
  );
}
