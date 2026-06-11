// components/OutputPanel.tsx — Renders the five sections via tabs.
import Tabs, { type Tab } from "./Tabs";
import SectionHeader from "./SectionHeader";
import ActionTable from "./ActionTable";
import type { Extracted, RiskItem } from "@/lib/types";

const severityClasses: Record<RiskItem["severity"], string> = {
  high: "bg-rose-100 text-rose-800 ring-rose-200",
  medium: "bg-amber-100 text-amber-800 ring-amber-200",
  low: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ring-1 ${className}`}>
      {children}
    </span>
  );
}

export default function OutputPanel({ result }: { result: Extracted | null }) {
  if (!result) {
    return (
      <div className="h-full grid place-items-center text-sm text-slate-400">
        <span>Awaiting input…</span>
      </div>
    );
  }

  const tabs: Tab[] = [
    { id: "actions",     label: "Actions",     icon: "✅" },
    { id: "obligations", label: "Obligations", icon: "📌" },
    { id: "risks",       label: "Risks",       icon: "⚠️" },
    { id: "questions",   label: "Questions",   icon: "❓" },
    { id: "summary",     label: "Summary",     icon: "🧭" },
  ];

  return (
    <Tabs tabs={tabs}>
      {(active) => {
        switch (active) {
          case "actions":
            return (
              <section>
                <SectionHeader icon="✅" title="Action Items" count={result.actions.length} />
                <ActionTable items={result.actions} />
              </section>
            );
          case "obligations":
            return (
              <section>
                <SectionHeader icon="📌" title="Key Obligations" count={result.obligations.length} />
                {result.obligations.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No obligations detected.</p>
                ) : (
                  <ul className="space-y-2">
                    {result.obligations.map((o, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-indigo-500 mt-0.5">▸</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          case "risks":
            return (
              <section>
                <SectionHeader icon="⚠️" title="Risks & Consequences" count={result.risks.length} />
                {result.risks.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No risks detected.</p>
                ) : (
                  <ul className="space-y-2">
                    {result.risks.map((r, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
                      >
                        <div className="flex items-start gap-2">
                          <Pill className={severityClasses[r.severity]}>{r.severity}</Pill>
                          <span className="flex-1">{r.text}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          case "questions":
            return (
              <section>
                <SectionHeader icon="❓" title="Open Questions" count={result.questions.length} />
                {result.questions.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No open questions detected.</p>
                ) : (
                  <ul className="space-y-2">
                    {result.questions.map((q, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          case "summary":
            return (
              <section>
                <SectionHeader icon="🧭" title="Summary" hint="max 5 lines" />
                {result.summary.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No summary available.</p>
                ) : (
                  <ul className="space-y-2">
                    {result.summary.map((s, i) => (
                      <li
                        key={i}
                        className="rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-3 text-sm text-slate-700"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          default:
            return null;
        }
      }}
    </Tabs>
  );
}
