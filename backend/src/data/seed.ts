import type { Request } from "../domain/types";

/**
 * A small but representative fixture set:
 *  - every status is covered,
 *  - every priority appears,
 *  - one request is overdue, one is due soon, one has no due date,
 *  - one request has notes and a multi-step history.
 *
 * Due dates are computed relative to the time the seed file is read so the
 * fixtures stay realistic regardless of when the app is reviewed.
 */
export function buildSeed(now: Date = new Date()): Request[] {
  const isoOffset = (days: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  const baseCreate = (n: number) => isoOffset(-n);

  return [
    {
      id: "req_001",
      title: "Vendor onboarding: Acme Logistics",
      submitter: "alex.morgan@acme-shipping.example",
      status: "NEW",
      priority: "HIGH",
      owner: null,
      dueDate: isoOffset(2),
      requiredFieldsComplete: false,
      rejectionReason: null,
      notes: [],
      history: [
        {
          id: "ev_001_a",
          type: "CREATED",
          at: baseCreate(1),
          actor: "alex.morgan@acme-shipping.example",
          payload: { title: "Vendor onboarding: Acme Logistics" },
        },
      ],
      createdAt: baseCreate(1),
      updatedAt: baseCreate(1),
    },
    {
      id: "req_002",
      title: "Marketing budget increase Q3",
      submitter: "priya.s@internal.example",
      status: "IN_REVIEW",
      priority: "MEDIUM",
      owner: "jordan.lee",
      dueDate: isoOffset(5),
      requiredFieldsComplete: true,
      rejectionReason: null,
      notes: [
        {
          id: "note_002_a",
          body: "Finance confirmed numbers align with FY plan.",
          author: "jordan.lee",
          createdAt: baseCreate(1),
        },
      ],
      history: [
        {
          id: "ev_002_a",
          type: "CREATED",
          at: baseCreate(3),
          actor: "priya.s@internal.example",
          payload: { title: "Marketing budget increase Q3" },
        },
        {
          id: "ev_002_b",
          type: "OWNER_CHANGED",
          at: baseCreate(2),
          actor: "ops.bot",
          payload: { from: null, to: "jordan.lee" },
        },
        {
          id: "ev_002_c",
          type: "STATUS_CHANGED",
          at: baseCreate(2),
          actor: "jordan.lee",
          payload: { from: "NEW", to: "IN_REVIEW" },
        },
        {
          id: "ev_002_d",
          type: "NOTE_ADDED",
          at: baseCreate(1),
          actor: "jordan.lee",
          payload: {
            noteId: "note_002_a",
            preview: "Finance confirmed numbers align with FY plan.",
          },
        },
      ],
      createdAt: baseCreate(3),
      updatedAt: baseCreate(1),
    },
    {
      id: "req_003",
      title: "Security exception: temporary VPN bypass",
      submitter: "sam.taylor@internal.example",
      status: "NEEDS_INFO",
      priority: "URGENT",
      owner: "morgan.kim",
      dueDate: isoOffset(-1),
      requiredFieldsComplete: false,
      rejectionReason: null,
      notes: [
        {
          id: "note_003_a",
          body: "Need MFA evidence and a fixed end date before I can move this forward.",
          author: "morgan.kim",
          createdAt: baseCreate(2),
        },
      ],
      history: [
        {
          id: "ev_003_a",
          type: "CREATED",
          at: baseCreate(5),
          actor: "sam.taylor@internal.example",
          payload: { title: "Security exception: temporary VPN bypass" },
        },
        {
          id: "ev_003_b",
          type: "OWNER_CHANGED",
          at: baseCreate(4),
          actor: "ops.bot",
          payload: { from: null, to: "morgan.kim" },
        },
        {
          id: "ev_003_c",
          type: "STATUS_CHANGED",
          at: baseCreate(4),
          actor: "morgan.kim",
          payload: { from: "NEW", to: "IN_REVIEW" },
        },
        {
          id: "ev_003_d",
          type: "STATUS_CHANGED",
          at: baseCreate(2),
          actor: "morgan.kim",
          payload: { from: "IN_REVIEW", to: "NEEDS_INFO" },
        },
        {
          id: "ev_003_e",
          type: "NOTE_ADDED",
          at: baseCreate(2),
          actor: "morgan.kim",
          payload: {
            noteId: "note_003_a",
            preview:
              "Need MFA evidence and a fixed end date before I can move this forward.",
          },
        },
      ],
      createdAt: baseCreate(5),
      updatedAt: baseCreate(2),
    },
    {
      id: "req_004",
      title: "New office wifi expansion",
      submitter: "facilities@internal.example",
      status: "APPROVED",
      priority: "LOW",
      owner: "jordan.lee",
      dueDate: null,
      requiredFieldsComplete: true,
      rejectionReason: null,
      notes: [],
      history: [
        {
          id: "ev_004_a",
          type: "CREATED",
          at: baseCreate(10),
          actor: "facilities@internal.example",
          payload: { title: "New office wifi expansion" },
        },
        {
          id: "ev_004_b",
          type: "OWNER_CHANGED",
          at: baseCreate(9),
          actor: "ops.bot",
          payload: { from: null, to: "jordan.lee" },
        },
        {
          id: "ev_004_c",
          type: "STATUS_CHANGED",
          at: baseCreate(9),
          actor: "jordan.lee",
          payload: { from: "NEW", to: "IN_REVIEW" },
        },
        {
          id: "ev_004_d",
          type: "STATUS_CHANGED",
          at: baseCreate(7),
          actor: "jordan.lee",
          payload: { from: "IN_REVIEW", to: "APPROVED" },
        },
      ],
      createdAt: baseCreate(10),
      updatedAt: baseCreate(7),
    },
    {
      id: "req_005",
      title: "Refund authorization: order #84219",
      submitter: "customer-success@internal.example",
      status: "REJECTED",
      priority: "MEDIUM",
      owner: "morgan.kim",
      dueDate: null,
      requiredFieldsComplete: true,
      rejectionReason: "Outside refund window; redirected to goodwill credit flow.",
      notes: [],
      history: [
        {
          id: "ev_005_a",
          type: "CREATED",
          at: baseCreate(14),
          actor: "customer-success@internal.example",
          payload: { title: "Refund authorization: order #84219" },
        },
        {
          id: "ev_005_b",
          type: "OWNER_CHANGED",
          at: baseCreate(13),
          actor: "ops.bot",
          payload: { from: null, to: "morgan.kim" },
        },
        {
          id: "ev_005_c",
          type: "STATUS_CHANGED",
          at: baseCreate(13),
          actor: "morgan.kim",
          payload: { from: "NEW", to: "IN_REVIEW" },
        },
        {
          id: "ev_005_d",
          type: "STATUS_CHANGED",
          at: baseCreate(12),
          actor: "morgan.kim",
          payload: {
            from: "IN_REVIEW",
            to: "REJECTED",
            rejectionReason:
              "Outside refund window; redirected to goodwill credit flow.",
          },
        },
      ],
      createdAt: baseCreate(14),
      updatedAt: baseCreate(12),
    },
    {
      id: "req_006",
      title: "Procurement: GPU cluster expansion",
      submitter: "ml-platform@internal.example",
      status: "IN_REVIEW",
      priority: "HIGH",
      owner: "morgan.kim",
      dueDate: isoOffset(1),
      requiredFieldsComplete: true,
      rejectionReason: null,
      notes: [],
      history: [
        {
          id: "ev_006_a",
          type: "CREATED",
          at: baseCreate(4),
          actor: "ml-platform@internal.example",
          payload: { title: "Procurement: GPU cluster expansion" },
        },
        {
          id: "ev_006_b",
          type: "OWNER_CHANGED",
          at: baseCreate(3),
          actor: "ops.bot",
          payload: { from: null, to: "morgan.kim" },
        },
        {
          id: "ev_006_c",
          type: "STATUS_CHANGED",
          at: baseCreate(3),
          actor: "morgan.kim",
          payload: { from: "NEW", to: "IN_REVIEW" },
        },
      ],
      createdAt: baseCreate(4),
      updatedAt: baseCreate(3),
    },
    {
      id: "req_007",
      title: "External consulting engagement: data platform",
      submitter: "cto-office@internal.example",
      status: "NEW",
      priority: "LOW",
      owner: null,
      dueDate: isoOffset(20),
      requiredFieldsComplete: true,
      rejectionReason: null,
      notes: [],
      history: [
        {
          id: "ev_007_a",
          type: "CREATED",
          at: baseCreate(1),
          actor: "cto-office@internal.example",
          payload: { title: "External consulting engagement: data platform" },
        },
      ],
      createdAt: baseCreate(1),
      updatedAt: baseCreate(1),
    },
    {
      id: "req_008",
      title: "Equipment purchase: ergonomic chairs",
      submitter: "people-ops@internal.example",
      status: "IN_REVIEW",
      priority: "LOW",
      owner: "jordan.lee",
      dueDate: isoOffset(6),
      requiredFieldsComplete: false,
      rejectionReason: null,
      notes: [
        {
          id: "note_008_a",
          body: "Pending vendor quote update for revised count (n=42).",
          author: "jordan.lee",
          createdAt: baseCreate(1),
        },
      ],
      history: [
        {
          id: "ev_008_a",
          type: "CREATED",
          at: baseCreate(2),
          actor: "people-ops@internal.example",
          payload: { title: "Equipment purchase: ergonomic chairs" },
        },
        {
          id: "ev_008_b",
          type: "OWNER_CHANGED",
          at: baseCreate(2),
          actor: "ops.bot",
          payload: { from: null, to: "jordan.lee" },
        },
        {
          id: "ev_008_c",
          type: "STATUS_CHANGED",
          at: baseCreate(2),
          actor: "jordan.lee",
          payload: { from: "NEW", to: "IN_REVIEW" },
        },
        {
          id: "ev_008_d",
          type: "NOTE_ADDED",
          at: baseCreate(1),
          actor: "jordan.lee",
          payload: {
            noteId: "note_008_a",
            preview: "Pending vendor quote update for revised count (n=42).",
          },
        },
      ],
      createdAt: baseCreate(2),
      updatedAt: baseCreate(1),
    },
  ];
}
