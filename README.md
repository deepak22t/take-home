# Annotation Activity Console

Internal activity console built for the frontend take-home exercise.

## Stack

- Next.js App Router
- React 18
- TypeScript with strict mode
- Redux Toolkit
- Tailwind CSS
- Jest + React Testing Library

## Run The App

1. Install app dependencies:

```bash
npm install
```

2. Start the frontend:

```bash
npm run dev
```

3. In a second terminal, start the provided mock server:

```bash
cd mock-server
npm install
npm run mock
```

4. Open `http://localhost:3000`.

## Environment

- Frontend expects the mock server at `http://localhost:4000`.
- Override with `NEXT_PUBLIC_API_BASE_URL` if needed.

## Test

```bash
npm test
```

## Notes

- Task data is normalized before it reaches UI components.
- The task list hydrates from IndexedDB cache, then revalidates from the server.
- The selected task summary is streamed incrementally and rendered through a sanitized markdown pipeline.
