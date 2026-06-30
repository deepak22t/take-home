<br />

# Part 2: Bug Hunt

### Bug 1: Stale interval state

The clock effect used `setTick(tick + 1)` inside an interval created with an empty dependency array, so the callback captured the initial `tick` value and kept trying to set the same next value. I fixed this by storing the current time and updating it inside the interval, which avoids the stale closure and guarantees a fresh rerender every second.

### Bug 2: Fetch firing with `selectedId = null`

The selection effect ran on first render and fetched `/api/tasks/null`, which is a bad request and not a meaningful state transition. I added an early return when there is no selection so the detail fetch only runs for a real task id.

### Bug 3: Missing `apiBase` dependency

The fetch effect depended on `selectedId` but also read `apiBase`, so a prop change could leave the component talking to the old backend. I included `apiBase` in the dependency array so the request source stays consistent with the current props.

### Bug 4: No cancellation or race protection

The original fetch had no cleanup, so fast selection changes or unmounts could allow an older response to win and write stale data into state. I used `AbortController` and cleanup functions so obsolete requests are cancelled and their results are ignored.

### Bug 5: State mutation in `setTasks`

`prev.push(t); return prev;` mutates React state in place and returns the same array reference, which can prevent rerenders and corrupt previous state assumptions. I replaced it with immutable upsert logic that returns a new array and replaces existing tasks by id instead of mutating the old state.

### Bug 6: In-place sorting during render

`tasks.sort(...)` mutates the source array, which means render code was mutating React state on every render. I fixed this by sorting a copied array inside `useMemo`, so render stays pure and the original state order is never mutated.

### Bug 7: Index keys in a changing list

Using `key={i}` is incorrect for a list that can be resorted or updated because React may reuse the wrong DOM nodes when item order changes. I switched the key to `task.id`, which is stable across inserts, updates, and resorting.

### Extra Issue I Found: The component had no bootstrap path for recent tasks

As written, the list starts empty and only fetches after clicking an existing item, so there is no way for a user to ever populate the ticker from the UI alone. I added an initial recent-task fetch so the component can actually show recent activity before a selection refresh happens.

<br />

# Part 3: Decisions

This document is intentionally short and practical. It focuses on the decisions I made for Part 1, the tradeoffs behind them, and what I would change next.

## State Management

I used Redux Toolkit with slices, thunks, selectors, and an entity adapter.

- I chose thunks over RTK Query because the screen combines paginated fetches, IndexedDB hydration, websocket merges, selected-task state, and a separate streamed summary lifecycle. I wanted one place to coordinate those flows explicitly.
- RTK Query would be a good choice for a more standard request/cache setup, but here I would still need custom logic for websocket merges, IndexedDB hydration, and streamed summary state, so the gain would be smaller.
- The tradeoff is more manual async code. I accepted that because it kept control flow obvious and interview-friendly.

## Normalization and Typing

I treated backend payloads as untrusted and normalized them before they reached the UI.

- `normalizeTask()` converts raw transport data into a stable internal `Task`.
- Known fields like `type`, `status`, `annotationCount`, `updatedAt`, `assignee`, and `meta` are normalized to safe values.
- I preserved `rawType` and `rawStatus` so the app stays honest about what the backend actually sent.
- I attached warnings to normalized tasks when fields were malformed instead of throwing or silently pretending the data was perfect.

The tradeoff is that normalization adds code up front, but it keeps components simpler and prevents the same defensive checks from being repeated throughout the app.

## Realtime Merge Strategy

I merged websocket events into the normalized store instead of refetching the list after every event.

- Known tasks are updated in place.
- Unknown task ids are allowed as partial entities so realtime events are not dropped.
- If a partial task becomes relevant, the app fetches the full task in the background.
- I deliberately do not inject off-page partial tasks into the visible current-page table. They stay in the store, but the table only shows `currentPageIds`.

The tradeoff is extra reducer complexity, but it avoids unnecessary refetches and keeps pagination behavior trustworthy.

## Safe Markdown Rendering

The streamed summary is treated as untrusted content.

- The summary is rendered with `react-markdown`.
- Markdown support is enabled with `remark-gfm`.
- Raw HTML passes through `rehype-raw`, but sanitization happens immediately in the same render pipeline with `rehype-sanitize`.
- The exact sanitization point is `TaskSummaryPanel`, where `ReactMarkdown` is configured with `rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}`.

This allows markdown and code blocks from the server to render, while stripping unsafe HTML such as scripts. I avoided `dangerouslySetInnerHTML`.

## IndexedDB Caching

I used IndexedDB via `localforage` for task-page caching.

- I cache the last fetched task page together with `page`, `pageSize`, `total`, and `cachedAt`.
- On app load, the UI hydrates from cache first.
- After cache hydration, it immediately revalidates by fetching the current page from the server.
- Fresh server data replaces cached page ids and updates the entity store.

To reduce stale-data bugs:

- cached data is never treated as final
- the app records cache and fresh timestamps separately
- realtime websocket merges still apply after hydration
- the visible table is controlled by current page ids, not by every entity currently in memory

This is basically a simple stale-while-revalidate approach.

## Messy and Edge Data

What I handled:

- unknown or inconsistent task `type`
- unknown or inconsistent `status`
- missing or invalid `assignee`
- invalid `annotationCount`
- invalid `updatedAt`
- invalid `meta`
- websocket events for tasks not currently loaded
- streamed summary content containing markdown, code blocks, and unsafe HTML

What I deliberately did not handle:

- a full conflict-resolution model between cache, websocket events, and refetches across multiple tabs
- schema validation with a dedicated runtime validation library
- rich retry/backoff policies for every failing network path
- persistence of every filtered page combination in IndexedDB

I kept the edge handling focused on the risks that mattered most for Part 1.

## What I Would Do Next

With more time, I would:

- add an integration test around websocket merge behavior
- add cache expiry and request deduplication
- tighten runtime validation further, possibly with a schema library
- improve stream error and retry handling
- consider RTK Query again if the data-fetching layer became more CRUD-oriented and less custom

## AI Usage

I used AI as a coding assistant for iteration, review, and writing support, but not as an authority.

- I used it to speed up implementation, refactoring, and to help draft tests and documentation.
- I verified the output by reading the code paths manually, fixing type issues, checking diagnostics, running tests, and comparing behavior against the prompt and mock server behavior.
- Where AI-generated output was too generic or over-designed, I rewrote it to match the actual project constraints.

I would be comfortable explaining and defending the final code without relying on the AI output.
