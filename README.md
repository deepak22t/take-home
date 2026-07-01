# Annotation Activity Console

A small internal console that lists tasks, merges live updates, and streams an AI summary for the selected task.
This repo is built against the provided mock server (REST + WebSocket + SSE) and focuses on predictable state + defensive normalization.

## What’s In Here

- Task table with sort, filter, search, and pagination (pagination is driven by the mock `/api/tasks` endpoint)
- Task detail panel for the selected row
- Live events over WebSocket (`task.updated`, `task.assigned`, `annotation.created`) merged into Redux state
- Streamed summary over SSE (`/api/tasks/:id/summary`) rendered incrementally as it arrives
- Safe markdown rendering (server stream is untrusted; scripts/unsafe HTML are stripped)
- IndexedDB cache (localforage): shows cached data immediately, then revalidates

## Stack

- Next.js (App Router) + React 18
- TypeScript (strict)
- Redux Toolkit (entity adapter + thunks + memoized selectors)
- Tailwind CSS
- Jest + React Testing Library

## Quick Start

Prereqs: Node.js + npm.

### 1) Start the mock server (port 4000)

```bash
cd mock-server
npm install
npm run mock
```

You should see:

```txt
mock on http://localhost:4000 (ws://localhost:4000/ws)
```

### 2) Start the frontend (port 3000)

In a separate terminal:

```bash
npm install
npm run dev
```

Open:
- http://localhost:3000

## Environment

By default the frontend talks to the mock server at `http://localhost:4000`.

To override:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## How Pagination/Filters Work (important)

The mock server paginates `/api/tasks` server-side. This app fetches the current page from the server.

- Page navigation triggers a new request for that page.
- Filters/search/sort are applied to the currently loaded page items (the mock server does not accept filter/search query params).

## Project Tour

If you want to follow the data flow quickly:

- API client: [client.ts](file:///c:/Desktop/front_end/lib/api/client.ts)
- API wrappers: [tasks.ts](file:///c:/Desktop/front_end/lib/api/tasks.ts)
- Normalization boundary: [normalize.ts](file:///c:/Desktop/front_end/lib/normalize.ts)
- Tasks state: [tasksSlice.ts](file:///c:/Desktop/front_end/store/tasks/tasksSlice.ts)
- Selectors (derived views): [tasksSelectors.ts](file:///c:/Desktop/front_end/store/tasks/tasksSelectors.ts)
- Live feed hook: [useTaskFeed.ts](file:///c:/Desktop/front_end/hooks/useTaskFeed.ts)
- Summary streaming UI: [TaskSummaryPanel.tsx](file:///c:/Desktop/front_end/components/tasks/TaskSummaryPanel.tsx)
- Cache helpers: [taskCache.ts](file:///c:/Desktop/front_end/lib/storage/taskCache.ts)

Implementation notes and tradeoffs live in: [DECISIONS.md](file:///c:/Desktop/front_end/DECISIONS.md)

## Tests

```bash
npm test
```

## Lint

```bash
npm run lint
```

## Common Issues

- “Failed to load tasks”: confirm the mock server is running on `http://localhost:4000`.
- Cached data looks “stale”: that’s expected briefly; the UI revalidates and then shows a fresh timestamp.
- Live updates show “partial task”: that happens when a WS event arrives for a task that isn’t in the currently loaded page yet; the app hydrates it on demand.
