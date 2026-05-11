# Architecture Notes

## Goals

The brief is small enough that the *real* point is "show how you build a
feature end-to-end". So the goals I optimized for, in order, were:

1. **Business rules live in one place** and are obvious to read.
2. **Tests prove the rules**, not just shape of the response.
3. **Clear seams** between transport (Express), domain logic, and storage —
   so swapping any one of them is mechanical.
4. **Just enough UI** to make every backend capability usable.

Everything below is a tradeoff in service of those goals.

---

## Layout

```
backend/
├── src/
│   ├── domain/         # Pure types & business rules (no Express, no I/O)
│   │   ├── types.ts
│   │   └── rules.ts
│   ├── repository/     # Storage interface + JSON-file implementation
│   │   ├── RequestRepository.ts
│   │   └── JsonFileRequestRepository.ts
│   ├── services/       # Orchestration: validates → mutates → records history
│   │   └── RequestService.ts
│   ├── http/           # Express wiring (routes, controllers, error handler)
│   │   ├── server.ts
│   │   ├── routes.ts
│   │   ├── controllers.ts
│   │   └── errors.ts
│   ├── data/           # Seed fixtures
│   │   └── seed.ts
│   └── index.ts        # Entry point
└── tests/              # Jest tests against the service layer
```

The frontend is a vanilla Next.js 14 App Router project. All HTTP is funneled
through a small `lib/api.ts` client so the pages stay declarative.

---

## Domain model

```ts
Request {
  id, title, submitter, status, priority, owner | null,
  dueDate (ISO string | null),
  requiredFieldsComplete: boolean,
  rejectionReason: string | null,
  notes:   Note[]            // { id, body, author, createdAt }
  history: HistoryEvent[]    // { id, type, at, actor, payload }
  createdAt, updatedAt
}
```

`HistoryEvent.type` is a discriminated union (`CREATED`, `STATUS_CHANGED`,
`OWNER_CHANGED`, `NOTE_ADDED`) so consumers can render it nicely without
parsing strings.

---

## Business rules

All rules live in `domain/rules.ts` as **pure functions** that return a typed
result instead of throwing. The service layer translates failures into a
single `DomainError` class which the Express error middleware turns into a
`422` response with a stable `code`. The rules currently encoded:

| Rule | Implementation |
| ---- | -------------- |
| Cannot approve without `requiredFieldsComplete` | `canTransitionTo` |
| Cannot reject without `rejectionReason` | `canTransitionTo` |
| Allowed status transitions (NEW → IN_REVIEW → APPROVED/REJECTED, etc.) | `canTransitionTo` |
| Every status change writes a `STATUS_CHANGED` event | `RequestService.changeStatus` |
| Every owner change writes an `OWNER_CHANGED` event | `RequestService.assignOwner` |
| Every note is timestamped on the server | `RequestService.addNote` |
| `dueSoon` = due in next 7 days (inclusive of today, exclusive of past) | `rules.dueState` |
| `overdue` = due date < now and status is not terminal | `rules.dueState` |

The `dueSoon`/`overdue` derivation is computed both:
- when returning a request (so the UI gets a `dueState` field with no work), and
- as a query filter (`GET /requests?due=due_soon`).

This avoids the UI re-implementing the date math.

---

## Persistence

I went with a JSON-file repository behind an interface
(`RequestRepository`). It costs nothing to set up, survives restarts, and the
service layer doesn't know it exists — swapping it for Postgres later is just
a new class.

The repository is intentionally write-through: every mutation rewrites the
file atomically (write to `queue.json.tmp` → rename). With this volume of
data that is fine and avoids any "did the file get corrupted on crash?"
questions. Tests use an in-memory variant.

---

## HTTP layer

- **Validation** uses [`zod`](https://zod.dev) at the controller boundary so
  the service can trust its inputs.
- **Errors** are normalized:
  - `DomainError` → 422 `{ code, message }`
  - `NotFoundError` → 404 `{ code: "not_found", message }`
  - zod errors → 400 `{ code: "invalid_request", issues }`
  - everything else → 500
- **CORS** is enabled for `http://localhost:3000` out of the box.

The HTTP layer is deliberately thin: parse → call service → respond.

---

## Frontend

- **Next.js 14 App Router** with client components for the interactive parts
  and `fetch` on the server for the initial list/detail load. The default
  cache is bypassed (`cache: "no-store"`) so the data is always fresh — a
  real product would tune this with revalidation tags.
- **State**: nothing more elaborate than `useState` + a single `useTransition`
  for optimistic-ish mutations. With a queue this size that's the right
  ceiling.
- **UI**: Tailwind, status pills with consistent colors, due-date badges that
  pick up `dueState` from the API.

---

## What I left out (and why)

- **Auth**: out of scope for the exercise. The API accepts an optional
  `actor` field on every mutation so history records "who did this" — in a
  real app that would come from a session.
- **Pagination**: the dataset is tiny; I'd add cursor pagination as soon as
  it grew. The query layer is already shaped for it.
- **Optimistic concurrency**: a real reviewer queue would want
  `If-Match`/`updatedAt` on PATCHes. Skipped to stay focused.
- **A real DB**: see above — the repository interface is the seam.
- **E2E tests**: covered the business rules with focused service tests where
  the value-per-line is highest. Adding Playwright would be the next step.

---

## How to extend it

- **New status?** Add to the enum in `domain/types.ts`, declare the
  transition in `rules.ts`, update the `STATUS_LABELS` map on the frontend.
  Tests will fail at the boundary if you miss one of the three.
- **New business rule?** Express it as a pure function in `rules.ts` and call
  it from the relevant service method. Write a test in
  `tests/rules.test.ts`.
- **New history event?** Extend `HistoryEvent` (discriminated union) and the
  renderer in `frontend/components/HistoryTimeline.tsx`.
