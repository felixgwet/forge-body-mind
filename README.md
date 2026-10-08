# Forge — Body & Mind Tracker

A mobile-first **Progressive Web App** for tracking strength training, sleep, and mental-performance habits. Installable on iOS/Android home screens, works offline, and stores all data locally on the device — no backend, no accounts, no tracking.

**Live:** https://pxjprg6xgwbug.kimi.page

## Why I built it

I wanted a single, private, no-friction app for my own training split and daily habits — gym sessions, sleep, meditation, reading, and chess — without signing up for yet another service that owns my data. A PWA was the right call: one codebase, installable like a native app, data stays on-device.

## Features

- **Train** — full weekly program (Mon/Tue/Thu/Fri/Sat split with Wed/Sun recovery days), tap-to-complete exercises, session timer, time-of-day capture, MET-based calorie estimation, 14-day volume chart, session history
- **Sleep** — hours + perceived restfulness logging, evidence-based feedback per duration band (7–9h optimal zone), 14-day trend chart
- **Streak** — retention tracker with an anecdotal milestone timeline (day 7 / 30 / 90), honestly labelled as community-reported rather than medical claims
- **Mind** — meditation / reading / chess check-ins with book + duration tracking, streak counters, researched benefit tiers, and escalating "days since last practice" warnings
- **Today dashboard** — progress rings, active habit warnings, streak overview, weekly summary, and milestone celebrations
- **Reminder engine** — per-habit reminder times with in-app alert banners (Notification API where the platform supports it)
- **Fully offline** — static bundle, `localStorage` persistence with a versioned state schema

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript (Vite 7) |
| Styling | Tailwind CSS 3.4, hand-built component library, custom design tokens |
| Charts | Custom dependency-free SVG bar/ring charts |
| State | React Context + `useReducer`, persisted to `localStorage` |
| Notifications | Web Notification API + in-app alert engine |
| PWA | Web manifest, iOS `apple-mobile-web-app` meta, standalone display |
| Hosting | Static bundle on Kimi Pages |

## Architecture

```
src/
├── App.tsx            # Shell: tab navigation, reminder/alert engine, settings
├── lib/
│   ├── store.tsx      # State context, reducer, localStorage persistence,
│   │                  # streak + date math, notification helper
│   └── data.ts        # Content layer: workout program, sleep research bands,
│                      # habit benefit tiers, milestone timelines
├── screens/           # Today, Train, Sleep, Retention, Mind
├── components/bits.tsx# Design-system primitives (Card, Ring, MiniBars, ...)
└── types.ts           # Shared domain models
```

Design decisions worth noting:

- **Single source of truth** — one versioned `State` object; every write goes through the reducer, which keeps persistence and cache invalidation trivial.
- **Content as data** — the workout program and all researched benefit copy live in `data.ts`, so the UI is a pure rendering layer over the domain model.
- **Streak math** — consecutive-day streaks computed from a `Set` of date keys, tolerating "today not logged yet" so streaks don't break mid-day.
- **Calorie model** — `kcal = MET (5.5) × bodyweight × hours`, deliberately surfaced in the UI as an approximation.

## Getting started

```bash
git clone https://github.com/<you>/forge-body-mind.git
cd forge-body-mind
npm install
npm run dev        # dev server
npm run build      # production bundle → dist/
```

Deploy `dist/` to any static host (Netlify, Vercel, GitHub Pages, S3…).

## AI-assisted development

This project was built with **Kimi** (AI assistant) as a pair-programming tool. I drove requirements, architecture, and design decisions; generated code was reviewed, adjusted, and tested by me before shipping. I treat AI the way I'd treat any accelerator — it writes fast, I own the result.

## License

MIT — see [LICENSE](LICENSE).
