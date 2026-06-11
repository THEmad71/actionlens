# ActionLens

> Turn dense policy, SOP, and email text into clear actions, risks, and a short summary — in seconds.

ActionLens is a single-page Next.js MVP. Paste any text on the left; get a structured breakdown on the right.

![ActionLens hero](public/favicon.svg)

---

## ✨ What it does

- **Action items** — checklist with `action`, `owner/role`, `due`, and `priority` (low/medium/high/urgent).
- **Key obligations** — extracted duties ("must", "shall", "required to"…).
- **Risks & consequences** — severity-tagged (low/medium/high).
- **Open questions** — anything in the text that asks for clarification.
- **Summary** — up to 5 lines.

Plus:

- **Example** button loads a realistic policy sample.
- **Copy Markdown** / **Download .md** for share-ready reports.
- **Autosave** to `localStorage` so you don't lose your paste.
- **Mobile responsive** — two columns on desktop, stacked on mobile.

---

## 🧠 How it works

ActionLens runs in two modes and **automatically picks the best one available**:

### 1) Heuristic mode (default, offline)

A pure, deterministic function (`lib/extract.ts`) that:

- Splits text into sentences / bullets.
- Classifies each line by keyword triggers (`must`, `shall`, `should`, `required`, `prohibited`, `by`, `within`, `every`…).
- Detects **owners** by matching known role keywords (IT, Security Team, DPO, Requestor, System Owner, Vendor…).
- Detects **due phrases** with regex (`within 24 hours`, `by Friday 5 PM`, `every Monday`, `no later than`, …).
- Assigns **priority** based on impact words + deadline presence.
- Assigns **severity** for risks based on impact words.

Runs **entirely in the browser**. No network calls. No data leaves your device.

### 2) AI mode (optional)

If the environment variable `ACTIONLENS_API_KEY` is set, the client calls `POST /api/extract`, which proxies to an OpenAI-compatible chat-completions endpoint. The model is forced to return JSON and the response is validated against the **Zod schema** (`lib/schema.ts`). On any failure the UI transparently falls back to the heuristic output and shows a small "AI unavailable, used heuristic" badge.

The schema (`lib/schema.ts`) is the **single source of truth** — both the heuristic output and the AI output must conform to it.

---

## 🔐 Environment variables

| Variable                  | Default                       | Purpose                                                |
|---------------------------|-------------------------------|--------------------------------------------------------|
| `ACTIONLENS_API_KEY`      | _(unset → heuristic mode)_    | Enables AI mode. If absent, the app is fully offline.  |
| `ACTIONLENS_API_BASE`     | `https://api.openai.com/v1`   | Any OpenAI-compatible base URL.                        |
| `ACTIONLENS_MODEL`        | `gpt-4o-mini`                 | Model name sent to the chat-completions endpoint.      |

> The route handler is **only** active when `ACTIONLENS_API_KEY` is present. Without it, `/api/extract` returns `503`.

---

## 🛠 Local development

Requirements: **Node.js 18.17+** (or 20+).

```bash
# 1. Install
npm install

# 2. Run dev server
npm run dev
# → http://localhost:3000

# 3. Production build
npm run build
npm run start

# 4. Lint
npm run lint
```

To enable AI mode locally, create `.env.local`:

```bash
ACTIONLENS_API_KEY=sk-...
ACTIONLENS_MODEL=gpt-4o-mini
# Optional: custom provider
# ACTIONLENS_API_BASE=https://api.openai.com/v1
```

---

## 🚀 One-click deploy to Vercel

The fastest way to ship this is via Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-user%2Factionlens&env=ACTIONLENS_API_KEY,ACTIONLENS_MODEL&envDescription=Optional%3A%20enable%20AI%20extraction.%20Leave%20blank%20to%20stay%20fully%20offline.)

Or manually:

1. Push the repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import it.
3. (Optional) Add `ACTIONLENS_API_KEY` and `ACTIONLENS_MODEL` in **Settings → Environment Variables**.
4. Click **Deploy**.

> No database. No auth. Static-friendly. Server route is cold-start friendly and only invoked when AI mode is enabled.

---

## 📁 File tree

```
actionlens/
├── app/
│   ├── api/extract/route.ts   # AI mode endpoint (Zod-validated)
│   ├── globals.css            # Tailwind + base styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Server entry → <ActionLens />
├── components/
│   ├── ActionLens.tsx         # Orchestrator (state, pipeline, hero, footer)
│   ├── ActionTable.tsx        # Interactive checklist
│   ├── EmptyState.tsx         # Idle/loading placeholders
│   ├── InputPanel.tsx         # Textarea + autosave + char counter
│   ├── OutputPanel.tsx        # Five sections rendered via tabs
│   ├── SectionHeader.tsx      # Reusable section heading
│   ├── Tabs.tsx               # Sticky tab bar
│   └── Toolbar.tsx            # Example / Clear / Copy / Download
├── lib/
│   ├── constants.ts           # Keyword sets
│   ├── example.ts             # Sample policy text
│   ├── extract.ts             # Heuristic extractor
│   ├── llm.ts                 # Client-side AI call + Zod validation
│   ├── markdown.ts            # Extracted → Markdown
│   ├── priority.ts            # Priority / severity helpers
│   ├── schema.ts              # Zod schema (single source of truth)
│   └── types.ts               # Re-exports inferred types
├── public/
│   └── favicon.svg
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
├── next-env.d.ts
├── .gitignore
├── .eslintrc.json
└── README.md
```

---

## 🔒 Privacy & limitations

- **Heuristic mode**: your text never leaves the browser. There is no server-side state.
- **AI mode**: your text is sent to the configured LLM provider over HTTPS. Do not paste content you are not permitted to share with that provider.
- **Output quality**: heuristic extraction is rule-based and will miss nuance. AI extraction depends on the model. Always review before acting.
- **Not legal/compliance advice**: ActionLens is an assistant, not a substitute for qualified review.

---

## 🧩 Extending

- **Swap the extractor**: `lib/extract.ts` exports `extractHeuristic(input)`. Replace it with an LLM call, a fine-tuned model, or a third-party API.
- **Change schema**: edit `lib/schema.ts`; types in `lib/types.ts` and the AI route's validator follow automatically.
- **Tune keywords**: edit `lib/constants.ts` (action/owner/due/risk/priority triggers).
- **Custom Markdown**: `lib/markdown.ts` is the single render point for export.
