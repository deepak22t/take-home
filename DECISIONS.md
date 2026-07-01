<br />

# Part 2: Bug Hunt

### Bug 1: Stale interval state

The interval callback captured the initial `tick` value because the effect ran only once with an empty dependency array. I fixed it by using a functional state update (`setTick(prev => prev + 1)`), which always receives the latest state without recreating the interval.

***

### Bug 2: Fetch with `selectedId = null`

The effect ran on the initial render and requested `/api/tasks/null`, which is not a valid task. I added an early return when `selectedId` is `null` so the fetch only runs for a valid task.

***

### Bug 3: Missing `apiBase` dependency

The effect used both `selectedId` and `apiBase`, but only `selectedId` was listed in the dependency array. I added `apiBase` so the effect always uses the latest API endpoint if the prop changes.

***

### Bug 4: Missing request cleanup

The fetch request had no cleanup, so an older request could finish after a newer one and overwrite fresh data. I used `AbortController` to cancel obsolete requests during cleanup and prevent stale updates.

***

### Bug 5: State mutation

The code used `prev.push(t)` and returned the same array, directly mutating React state. I replaced it with an immutable update that returns a new array, allowing React to detect the state change correctly.

***

### Bug 6: In-place sorting during render

`Array.sort()` mutates the original array, so the component was mutating React state while rendering. I sorted a copied array (`[...tasks].sort(...)`) so rendering remains a pure operation.

***

### Bug 7: Unstable list keys

The component used the array index as the React key even though the list can be reordered. I changed the key to `task.id`, which is stable and prevents incorrect DOM reuse.

# Part 3: Decisions

This section summarizes the key implementation decisions, their tradeoffs, and what I would improve next.

## State Management (RTK Thunks vs RTK Query)

I used Redux Toolkit with slices, thunks, selectors, and an entity adapter.

- I chose thunks over RTK Query because this app coordinates a paginated list fetch, cache hydration, websocket merges, selected-task state, and a separate streamed summary lifecycle. I wanted explicit control over those transitions.
- RTK Query would work well for a more standard request/cache setup, but I would still need custom logic for websocket merges and the streamed summary, so the gain would be smaller here.
- Tradeoff: more manual async code, but the control flow stays obvious and easy to explain.

## Pagination and Filtering (Strictly following the mock)

The mock server paginates `/api/tasks`, so the task list is fetched page-wise (not fully loaded).

- Page navigation triggers a request for that page; the UI shows a loading indicator while waiting.
- Filters/search/sort are applied to the currently loaded page items because the mock API does not support filter/search query params.
- Tradeoff: better scalability and it matches the prompt’s pagination requirement, but filtering is not global across all tasks without a server-side query API.

## Normalization and Typing

I treated backend payloads as untrusted and normalized them before they reached UI components.

- `normalizeTask()` converts raw transport data into a stable internal `Task` discriminated union.
- `type` and `status` are normalized (including inconsistent casing/spelling), while `rawType` and `rawStatus` are preserved so the UI stays honest.
- Timestamps, counts, `assignee`, and `meta` are narrowed and coerced safely; malformed fields add warnings instead of crashing or silently pretending the data is clean.

Tradeoff: extra up-front code, but components stay simple and consistently typed.

## Realtime Merge Strategy

I merge websocket events into the normalized store instead of refetching the list on every event.

- Known tasks are updated in place.
- Unknown task ids are allowed as partial entities so events are not dropped; the app can hydrate the full record on demand.
- The visible table remains tied to `currentPageIds` so off-page live events don’t “teleport” items into the current page view.

Tradeoff: reducer logic is more complex, but list paging remains predictable.

## Streamed Markdown Safety (exact sanitization point)

The summary stream is untrusted.

- Rendering uses `react-markdown` + `remark-gfm`.
- Raw HTML is parsed via `rehype-raw` but sanitized immediately via `rehype-sanitize` with an allowlist schema.
- Sanitization happens in `TaskSummaryPanel` where `ReactMarkdown` is configured with `rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}`.

This allows markdown and code blocks while stripping scripts/unsafe HTML. I avoided `dangerouslySetInnerHTML`.

## IndexedDB Caching (stale-while-revalidate)

I used IndexedDB via `localforage` to cache the most recently loaded task page.

- Cached payload includes `items`, `page`, `pageSize`, `total`, and `cachedAt`.
- On load, the UI hydrates from cache immediately and then revalidates by fetching the current page from the server.
- To avoid stale-data bugs, the UI labels cached vs fresh timestamps and the list reducer ignores out-of-order page responses (request-id guard).

## Messy / Edge Data

Handled:
- unknown/inconsistent `type` and `status`
- epoch-ms vs ISO timestamps
- string vs number counts
- missing/invalid `assignee` and `meta`
- websocket events referencing tasks not in the current page
- streamed summary containing markdown, code blocks, and malicious HTML/script payloads

Deliberately not handled:
- server-side filtering/search API (mock limitation)
- cross-tab conflict resolution between cache, websocket events, and refetches
- full retry/backoff policies for every network path
- runtime schema validation library for the entire payload surface

## What I’d Do Next

- If the dataset is small and the API is fixed, I’d consider fetching all tasks once and doing client-side filter/sort/pagination (better filter UX, but not scalable).
- For larger datasets, I’d add a server query API and keep pagination strict, e.g.:
  - `/api/tasks?page=1&pageSize=20&type=image&status=done&search=foo&sortBy=updatedAt&sortDir=desc`
  - and move to cursor pagination if the list grows.
- Add an integration test for websocket merge behavior and one for page navigation + loading indicator.

## AI Usage and Verification

I used AI as a coding assistant for iteration and drafting, not as an authority.

- I verified changes by reading the code paths, checking TypeScript diagnostics, running `npm test` and `npm run lint`, and comparing behavior against the prompt and mock server behavior.
