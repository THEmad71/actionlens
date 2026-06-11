// components/ActionTable.tsx — Interactive checklist of action items.
"use client";

import { useState } from "react";
import type { ActionItem, Priority } from "@/lib/types";

const priorityClasses: Record<Priority, string> = {
  urgent: "bg-rose-100 text-rose-800 ring-rose-200",
  high: "bg-orange-100 text-orange-800 ring-orange-200",
  medium: "bg-amber-100 text-amber-800 ring-amber-200",
  low: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export default function ActionTable({ items }: { items: ActionItem[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (items.length === 0) {
    return <p className="text-sm text-slate-500 italic">No action items detected.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white overflow-hidden">
      {items.map((a, i) => {
        const checked = done.has(i);
        return (
          <li key={i} className="p-3 hover:bg-slate-50 transition">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={checked}
                onChange={() => toggle(i)}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium text-slate-800 ${
                    checked ? "line-through text-slate-400" : ""
                  }`}
                >
                  {a.action}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  {a.owner && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      👤 {a.owner}
                    </span>
                  )}
                  {a.due && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      ⏰ {a.due}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ring-1 ${priorityClasses[a.priority]}`}
                  >
                    {a.priority}
                  </span>
                </div>
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
