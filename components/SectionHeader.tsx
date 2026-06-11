// components/SectionHeader.tsx
import type { ReactNode } from "react";

export default function SectionHeader({
  icon,
  title,
  count,
  hint,
}: {
  icon: ReactNode;
  title: string;
  count?: number;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">{icon}</span>
        <h3 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">{title}</h3>
        {typeof count === "number" && (
          <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {count}
          </span>
        )}
      </div>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  );
}
