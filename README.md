# RECLAIM 122

A 122-day personal consistency tracker (Sep 1 – Dec 31, 2026) for four goals: **Discipline**, **Fitness**,
**Product Management**, and **Python**. Calm, calendar-first, mobile PWA. No scores, no shame.

> **This repository ships with synthetic demo data by default.** It never contains real personal
> tracking data — see [Privacy](#privacy--repository-strategy) below.

## Stack (100% free tier)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast, portable, static-buildable |
| UI | Tailwind CSS, Lucide icons | Small, no design-system lock-in |
| Data | Supabase (Postgres + Auth + RLS) | Free tier: 500MB DB, unlimited API requests, is enough for one user |
| Hosting | GitHub Pages + GitHub Actions | Free static hosting + free CI minutes on a public repo |
| Auth | Supabase magic-link (passwordless) | No password UX to build or maintain |
| Tests | Vitest, React Testing Library, Playwright | Core logic is unit-tested; check-in flow has an e2e smoke test |
| Charts | Recharts | Weekly consistency bars, status breakdown pie, per-goal metric trends |
| Motion | Framer Motion | Card entrance animations, count-up numbers, page transitions |

Nothing here requires a paid plan. Supabase's free project pauses after ~1 week of total inactivity
(not daily use) — a normal daily-use pattern keeps it awake indefinitely.

## Getting started (local dev)

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + anon key, or leave blank for demo mode
npm run dev
```

With no `.env.local`, the app runs in **demo mode** automatically — synthetic data, no network calls,
nothing to configure. Good for just looking at the UI.

## Setting up your private Supabase project (for real tracking)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/schema.sql` from this repo (creates tables + Row Level Security).
3. In Project Settings → API, copy the **Project URL** and **anon/public key** into `.env.local`.
4. In Authentication → URL Configuration, add your local (`http://localhost:5173`) and deployed
   GitHub Pages URL as allowed redirect URLs.
5. `npm run dev`, sign in with your email via the magic link. A `RECLAIM 122` mission row is
   created automatically on first save.

**Never** put your Supabase `service_role` key anywhere in this codebase — only the `anon` key,
which is safe to ship to the browser because Row Level Security restricts every row to its owner.

## Deploying (free)

This repo's `.github/workflows/deploy.yml` builds and deploys to GitHub Pages automatically on
push to `main`.

- **Public showcase repo**: don't set the `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` repo
  secrets. The workflow falls back to demo mode automatically, so the public deployment only ever
  shows synthetic data.
- **Private personal deployment**: use a separate private repo (or a private GitHub Pages
  environment) with the Supabase secrets set under Settings → Secrets and variables → Actions.
- In repo Settings → Pages, set the source to "GitHub Actions".
- `BASE_PATH` in the workflow is derived from the repo name automatically for project pages
  (`https://<you>.github.io/<repo>/`). If you use a `<you>.github.io` user-page repo instead,
  change `BASE_PATH` to `/`.

## Architecture note: why Supabase at all

GitHub Pages is static file hosting — it cannot store or sync application data across devices by
itself. Since the whole point of RECLAIM 122 is a single history that's the same on your phone and
your laptop, a small managed database is required. Supabase's free tier (Postgres + Auth + Row
Level Security) is the smallest piece of infrastructure that satisfies that without asking you to
run or pay for a server.

## Data model

```
missions → day_records (1 per date) → goal_records (1 per goal per day)
                                          ├── fitness_data
                                          ├── pm_data
                                          ├── python_data
                                          └── excuse_data (yellow reason)
```

Full schema with constraints, indexes, and RLS policies: [`supabase/schema.sql`](./supabase/schema.sql).

## Status & streak rules (implemented in `src/lib/status.ts` and `src/lib/streaks.ts`)

- **Discipline is RED only** when the user reports intentional pornography viewing *and*
  masturbation that day. Urges are never tracked and never cause RED.
- **Overall day is RED** if any of the four goals is RED that day — otherwise it's GREEN, BLUE
  (user-marked partial), or YELLOW (excused) based on what was recorded.
- **Streaks**: GREEN, BLUE, and YELLOW all continue a streak; RED breaks it; a day with no record
  at all is NOT_RECORDED and is neutral — it neither breaks nor extends the streak.
- No day, goal, or mission ever gets a 0–100 score. This was a deliberate decision (see below).

## v2: UI/UX redesign

The look and navigation were substantially reworked while leaving all status/streak
business logic untouched (still the same 22 passing unit tests):

- **Home**: a swipeable day strip (no arrows — just scroll) shows every mission day at
  a glance; the four headline stats are now animated, colorful icon cards (count-up
  numbers, a pulsing flame while a streak is alive); a small ring shows mission
  progress (% of days elapsed).
- **Per-goal drill-down**: tapping a goal — from Home, Calendar, or Analytics — opens
  a dedicated page for that goal instead of a shared generic view. Calendar and
  Analytics each have their own goal-specific destinations (`/calendar/:goal`,
  `/analytics/:goal`), matching the pattern of the top-level Calendar/Analytics hubs.
- **Analytics**: an overall status breakdown (pie) and weekly consistency trend (bar
  chart) up top, then a goal picker. Each goal's page adds one extra chart only where
  it's genuinely informative — weight trend for Fitness, applications/week for PM,
  learning minutes/week for Python — nothing decorative or filler.
- **Visual identity**: every goal now has a fixed accent color for its icon (independent
  of that day's green/blue/red/yellow status), rounded elevated cards with soft
  shadows instead of hard borders, and consistent Apple Health-inspired spacing —
  without copying Apple's actual UI or assets.
- Old `/goal/:goal` links redirect automatically to `/analytics/:goal` so nothing
  breaks if that URL was bookmarked.



- **No daily score.** A single number invites optimizing the number instead of the behavior, and
  collapses four independent goals into one figure that hides which one actually needs attention.
  The four goal weights are stored for future analytics only.
- **Check-in is under two minutes by design.** Every field except the core status toggle is
  optional (steps, weight, applications, minutes, notes). Nothing blocks saving the day.
- **NOT_RECORDED is not RED.** Missing a check-in and failing a goal are different situations with
  different causes; conflating them punishes forgetting to open the app as much as an actual lapse.
- **Blue is manual, never automatic.** Thresholds for "partial" are personal and shouldn't be
  guessed by the system.

## Testing

```bash
npm test              # unit tests: status rules, streak math, date boundaries (22 tests)
npx playwright install && npx playwright test   # e2e check-in smoke test (demo mode)
```

## Privacy & repository strategy

- This public repo must only ever contain code, docs, and the seeded synthetic demo dataset
  (`src/demo/syntheticData.ts`, generated deterministically — not derived from real data).
- Real tracking data lives only in your private Supabase project, gated by Row Level Security.
- `.env.local` is git-ignored; only `.env.example` (no real values) is committed.
- Never commit a `service_role` key, exported personal data, or database backups.

## Non-goals (intentionally out of MVP scope)

AI coaching, push notifications, calorie/macro/sleep tracking, a job-application CRM, a Python
topic taxonomy, badges/XP/leaderboards, social features, native mobile apps. See the PRD for the
full list — these are deliberately deferred, not forgotten.
