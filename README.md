# TALENTFLOW – A Mini Hiring Platform (No Backend)

TALENTFLOW is a local-first, HR-centric hiring platform with a modern dark UI. It uses Mock Service Worker (MSW) to simulate a backend and Dexie (IndexedDB) for persistence.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS (dark theme: #121212, #1e1e1e, accents: #bb85fb, #00dac5)
- Redux Toolkit (jobs, assessments, candidates)
- Dexie (IndexedDB persistence)
- MSW (mock API, artificial latency + failures)
- React Router

## Getting Started

1. Install

```
npm install
```

2. Run

```
npm run dev
```

App boots MSW, seeds IndexedDB, and opens at `http://localhost:5173/`.

## Project Structure (high-level)

- `src/pages/LandingPage.tsx` – marketing/intro page (no navbar, full-width)
- `src/pages/JobsPage.tsx` – jobs board (pagination, filters, DnD ordering)
- `src/pages/JobDetailPage.tsx` – job details + applicants list
- `src/pages/AssessmentBuilderPage.tsx` – assessment builder + live preview
- `src/pages/CandidatesKanbanPage.tsx` – pipeline Kanban with DnD + toggle to virtualized list
- `src/pages/CandidateProfilePage.tsx` – candidate timeline, notes with @mentions
- `src/mocks/handlers.ts` – MSW endpoints (jobs, assessments, candidates)
- `src/mocks/seed.ts` – Dexie seeding (jobs, 3 seeded assessments, 1000 candidates)
- `src/store` – Redux Toolkit slices & store config
- `src/components` – Navbar, Cards, Buttons, Toast, Loader, Virtual list, etc.

## Key Features

- Dark, responsive UI with accessible contrast
- Jobs board
  - Search (title), filter by status & tags
  - Create/Edit/Archive/Delete
  - DnD reorder with optimistic update + rollback on failure
  - Deep links: `/jobs/:jobId`
- Assessments
  - Builder with sections & questions (single/multi, text, numeric, file stub)
  - Validation (required, numeric range, max length)
  - Conditional questions (e.g., show if prev answer == "Yes")
  - Live preview
  - Endpoints: `GET/PUT /assessments/:jobId`, `POST /assessments/:jobId/submit`
- Candidates
  - Kanban by stages (applied → hired/rejected), DnD stage transitions with optimistic update + rollback
  - Global “All candidates” virtualized list with client search and stage filter
  - Candidate profile with timeline (stage changes, notes), @mention suggestions (local list)
  - Routes: `/candidates`, `/candidates/:id`, `/jobs/:jobId/candidates`

## Theming

- Global dark theme via Tailwind tokens
- Accent gradient logo & CTAs with `#bb85fb` and `#00dac5`

## Mock API (MSW)

- Jobs
  - `GET /jobs?search=&status=&tags=&page=&pageSize=`
  - `POST /jobs` (create)
  - `PATCH /jobs/:id` (update/archive)
  - `DELETE /jobs/:id` (delete + renormalize order)
  - `PATCH /jobs/:id/reorder` (re-sequence)
- Assessments
  - `GET /assessments/:jobId`
  - `PUT /assessments/:jobId`
  - `POST /assessments/:jobId/submit`
- Candidates
  - `GET /candidates?search=&stage=&jobId=&page=&pageSize=`
  - `POST /candidates` (create)
  - `PATCH /candidates/:id` (stage transitions or update)
  - `GET /candidates/:id` (fetch one)
  - `GET /candidates/:id/timeline` (events)
  - `POST /candidates/:id/timeline` (add note)

### Artificial Latency & Failure Injection

- All write endpoints include randomized latency: 200–1200ms
- Error rate ~5–10% (random) on write endpoints to test optimistic UI & error handling

## Seeding & Data

- Seeding runs on app start (`src/main.tsx` → `seedDatabase()`)
- Jobs: diverse titles with tags, order, createdAt
- Assessments: 3 comprehensive examples (10+ questions each) with conditional logic
- Candidates: 1000 generated candidates mapped across jobs; initial timeline entry

To clear data (optional utility): see `clearAllData()` in `src/main.tsx` (commented by default).

## Routing

- `/` → Landing page (no navbar)
- App layout (with navbar + constrained content):
  - `/jobs`, `/jobs/:jobId`, `/jobs/:jobId/assessment`, `/jobs/:jobId/applicants`, `/jobs/:jobId/candidates`
  - `/candidates`, `/candidates/:id`

## Dev Notes

- If MSW fails to register, ensure `public/mockServiceWorker.js` exists. Re-run:

```
npx msw init ./public --save
```

- If assessments or candidates don’t appear, hard refresh to re-trigger seeding (IndexedDB).
- When testing optimistic updates, watch for toasts/errors and verify state rolls back on 500s.
