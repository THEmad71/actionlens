// components/Tabs.tsx — Sticky tab bar + scrollable section panels.
"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export type Tab = { id: string; label: string; icon: string };

export default function Tabs({
  tabs,
  children,
}: {
  tabs: Tab[];
  children: (active: string) => ReactNode;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 -mx-1 px-1 bg-slate-50/80 backdrop-blur border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto thin-scroll">
          {tabs.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`px-3 py-2 text-sm whitespace-nowrap rounded-t-md border-b-2 transition ${
                  isActive
                    ? "border-indigo-600 text-indigo-700 font-medium"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <span className="mr-1">{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto thin-scroll py-4 animate-fade-in">
        {children(active)}
      </div>
    </div>
  );
}
