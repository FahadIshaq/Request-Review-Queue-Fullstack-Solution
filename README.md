# Request Review Queue

A small internal tool for reviewing incoming requests. The app lets reviewers
triage a queue of submissions: filter by status / owner / due date, change the
status of a request (with the right validation), assign and reassign owners,
add notes, and inspect a full activity history.

> **Stack:** Next.js · React · TypeScript · Tailwind CSS · Node.js · Express · Jest

---

## Repository layout

```
.
├── backend/        # Express + TypeScript API (Jest tests, in-memory + JSON persistence)
├── frontend/       # Next.js (App Router) + Tailwind UI
├── ARCHITECTURE.md # Design notes & tradeoffs
└── README.md
```

Each app is self-contained and is started independently.

---

## Prerequisites

- Node.js **>= 18.17** (Next.js 14 requirement)
- npm **>= 9**

That's it — no database to install. The backend uses an in-memory store
backed by a JSON file so the queue survives restarts.

---

## Quick start

Open two terminals.

### 1. Backend (port `4000`)

```bash
cd backend
npm install
npm run dev
```

The first run automatically seeds the queue from `backend/src/data/seed.ts`
(8 representative requests covering every status, priority, and due-date state).

Health check: <http://localhost:4000/health>
API base:    <http://localhost:4000/api>

### 2. Frontend (port `3000`)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

The frontend reads the API base URL from `NEXT_PUBLIC_API_BASE_URL`
(defaulting to `http://localhost:4000/api`). To point it elsewhere create
`frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

---

## Running the tests

```bash
cd backend
npm test
```

Tests cover the required scenarios:

- approving when required fields are incomplete (rejected)
- approving when required fields are complete (allowed)
- rejecting without a reason (rejected)
- rejecting with a reason (allowed, reason stored)
- history creation on every status change
- history creation on every owner reassignment
- notes are timestamped
- `dueSoon` and `overdue` filtering
- filtering by status and owner
- 404s and validation errors

Run with coverage:

```bash
npm run test -- --coverage
```

---

## API surface (cheat sheet)

Base URL: `/api`

| Method | Path                              | Description |
| -----: | --------------------------------- | ----------- |
| `GET`  | `/requests`                       | List requests. Query params: `status`, `owner`, `due` (`due_soon` \| `overdue`), `q` (text search) |
| `POST` | `/requests`                       | Create a request |
| `GET`  | `/requests/:id`                   | Fetch one request (includes history & notes) |
| `PATCH`| `/requests/:id/status`            | Change status. Body: `{ status, rejectionReason?, actor? }` |
| `PATCH`| `/requests/:id/owner`             | Assign/reassign owner. Body: `{ owner, actor? }` |
| `POST` | `/requests/:id/notes`             | Add note. Body: `{ body, actor? }` |
| `GET`  | `/requests/:id/history`           | Return the activity history |
| `GET`  | `/owners`                         | List distinct owners (handy for the UI filter) |

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the design rationale and tradeoffs.

---

## Resetting the data

The persistence layer writes to `backend/data/queue.json` (gitignored).
Delete that file and restart the backend to re-seed from fixtures.

```bash
rm backend/data/queue.json
```
