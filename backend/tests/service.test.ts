import { DomainError, NotFoundError } from "../src/domain/errors";
import { InMemoryRequestRepository } from "../src/repository/InMemoryRequestRepository";
import { RequestService } from "../src/services/RequestService";

function buildService(now: Date = new Date("2026-06-15T12:00:00Z")) {
  const repo = new InMemoryRequestRepository();
  let counter = 0;
  const idGen = () => `id_${(++counter).toString().padStart(4, "0")}`;
  const service = new RequestService(repo, () => now, idGen);
  return { repo, service };
}

describe("RequestService.create", () => {
  it("creates a request with a CREATED history event and decorates dueState", async () => {
    const { service } = buildService();
    const r = await service.create({
      title: "Test",
      submitter: "alice@example.com",
      actor: "alice@example.com",
      dueDate: "2026-06-18T00:00:00Z",
    });
    expect(r.id).toBe("id_0001");
    expect(r.status).toBe("NEW");
    expect(r.dueState).toBe("DUE_SOON");
    expect(r.history).toHaveLength(1);
    expect(r.history[0].type).toBe("CREATED");
    expect(r.history[0].actor).toBe("alice@example.com");
  });

  it("rejects empty titles and submitters", async () => {
    const { service } = buildService();
    await expect(
      service.create({ title: "", submitter: "x" })
    ).rejects.toBeInstanceOf(DomainError);
    await expect(
      service.create({ title: "x", submitter: "  " })
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("rejects invalid due dates", async () => {
    const { service } = buildService();
    await expect(
      service.create({ title: "x", submitter: "y", dueDate: "not-a-date" })
    ).rejects.toBeInstanceOf(DomainError);
  });
});

describe("RequestService.changeStatus", () => {
  it("refuses to approve until requiredFieldsComplete is true", async () => {
    const { service } = buildService();
    const created = await service.create({ title: "T", submitter: "S" });
    await service.changeStatus(created.id, { status: "IN_REVIEW" });

    await expect(
      service.changeStatus(created.id, { status: "APPROVED" })
    ).rejects.toMatchObject({ code: "required_fields_incomplete" });
  });

  it("approves when requiredFieldsComplete is true and records history", async () => {
    const { service } = buildService();
    const created = await service.create({
      title: "T",
      submitter: "S",
      requiredFieldsComplete: true,
    });
    await service.changeStatus(created.id, {
      status: "IN_REVIEW",
      actor: "reviewer",
    });
    const approved = await service.changeStatus(created.id, {
      status: "APPROVED",
      actor: "reviewer",
    });

    expect(approved.status).toBe("APPROVED");
    const statusChanges = approved.history.filter(
      (e) => e.type === "STATUS_CHANGED"
    );
    expect(statusChanges).toHaveLength(2);
    expect(statusChanges[1]).toMatchObject({
      type: "STATUS_CHANGED",
      actor: "reviewer",
      payload: { from: "IN_REVIEW", to: "APPROVED" },
    });
  });

  it("refuses to reject without a rejection reason", async () => {
    const { service } = buildService();
    const created = await service.create({ title: "T", submitter: "S" });
    await service.changeStatus(created.id, { status: "IN_REVIEW" });

    await expect(
      service.changeStatus(created.id, { status: "REJECTED" })
    ).rejects.toMatchObject({ code: "rejection_reason_required" });

    await expect(
      service.changeStatus(created.id, {
        status: "REJECTED",
        rejectionReason: "   ",
      })
    ).rejects.toMatchObject({ code: "rejection_reason_required" });
  });

  it("rejects with a reason, persists the reason, and records it in history", async () => {
    const { service } = buildService();
    const created = await service.create({ title: "T", submitter: "S" });
    await service.changeStatus(created.id, { status: "IN_REVIEW" });

    const rejected = await service.changeStatus(created.id, {
      status: "REJECTED",
      rejectionReason: "Out of policy.",
      actor: "compliance",
    });

    expect(rejected.status).toBe("REJECTED");
    expect(rejected.rejectionReason).toBe("Out of policy.");

    const last = rejected.history[rejected.history.length - 1];
    expect(last.type).toBe("STATUS_CHANGED");
    if (last.type === "STATUS_CHANGED") {
      expect(last.payload).toMatchObject({
        from: "IN_REVIEW",
        to: "REJECTED",
        rejectionReason: "Out of policy.",
      });
    }
  });

  it("refuses illegal transitions", async () => {
    const { service } = buildService();
    const created = await service.create({
      title: "T",
      submitter: "S",
      requiredFieldsComplete: true,
    });
    await expect(
      service.changeStatus(created.id, { status: "APPROVED" })
    ).rejects.toMatchObject({ code: "invalid_transition" });
  });

  it("writes a STATUS_CHANGED history event on every status change", async () => {
    const { service } = buildService();
    const created = await service.create({
      title: "T",
      submitter: "S",
      requiredFieldsComplete: true,
    });
    let r = await service.changeStatus(created.id, { status: "IN_REVIEW" });
    r = await service.changeStatus(r.id, { status: "NEEDS_INFO" });
    r = await service.changeStatus(r.id, { status: "IN_REVIEW" });
    r = await service.changeStatus(r.id, { status: "APPROVED" });

    const statusEvents = r.history.filter((e) => e.type === "STATUS_CHANGED");
    expect(statusEvents).toHaveLength(4);
    expect(statusEvents.map((e) => e.type === "STATUS_CHANGED" && e.payload.to)).toEqual([
      "IN_REVIEW",
      "NEEDS_INFO",
      "IN_REVIEW",
      "APPROVED",
    ]);
  });

  it("404s when the request is missing", async () => {
    const { service } = buildService();
    await expect(
      service.changeStatus("nope", { status: "IN_REVIEW" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("RequestService.assignOwner", () => {
  it("writes an OWNER_CHANGED event on assignment", async () => {
    const { service } = buildService();
    const created = await service.create({ title: "T", submitter: "S" });

    const updated = await service.assignOwner(created.id, {
      owner: "jordan",
      actor: "manager",
    });
    expect(updated.owner).toBe("jordan");

    const last = updated.history[updated.history.length - 1];
    expect(last.type).toBe("OWNER_CHANGED");
    if (last.type === "OWNER_CHANGED") {
      expect(last.payload).toEqual({ from: null, to: "jordan" });
      expect(last.actor).toBe("manager");
    }
  });

  it("writes an OWNER_CHANGED event on reassignment", async () => {
    const { service } = buildService();
    const created = await service.create({ title: "T", submitter: "S" });
    await service.assignOwner(created.id, { owner: "jordan" });
    const updated = await service.assignOwner(created.id, { owner: "morgan" });
    const last = updated.history[updated.history.length - 1];
    expect(last.type).toBe("OWNER_CHANGED");
    if (last.type === "OWNER_CHANGED") {
      expect(last.payload).toEqual({ from: "jordan", to: "morgan" });
    }
  });

  it("supports unassigning by passing null or empty string", async () => {
    const { service } = buildService();
    const created = await service.create({ title: "T", submitter: "S" });
    await service.assignOwner(created.id, { owner: "jordan" });
    const updated = await service.assignOwner(created.id, { owner: null });
    expect(updated.owner).toBeNull();
    const last = updated.history[updated.history.length - 1];
    if (last.type === "OWNER_CHANGED") {
      expect(last.payload).toEqual({ from: "jordan", to: null });
    }
  });

  it("rejects reassigning to the same owner", async () => {
    const { service } = buildService();
    const created = await service.create({ title: "T", submitter: "S" });
    await service.assignOwner(created.id, { owner: "jordan" });
    await expect(
      service.assignOwner(created.id, { owner: "jordan" })
    ).rejects.toMatchObject({ code: "owner_unchanged" });
  });
});

describe("RequestService.addNote", () => {
  it("adds a timestamped note and records a NOTE_ADDED history event", async () => {
    const fixed = new Date("2026-06-15T12:00:00.000Z");
    const { service } = buildService(fixed);

    const created = await service.create({ title: "T", submitter: "S" });
    const updated = await service.addNote(created.id, {
      body: "Looks good to me.",
      actor: "reviewer",
    });

    expect(updated.notes).toHaveLength(1);
    expect(updated.notes[0]).toMatchObject({
      body: "Looks good to me.",
      author: "reviewer",
      createdAt: fixed.toISOString(),
    });

    const last = updated.history[updated.history.length - 1];
    expect(last.type).toBe("NOTE_ADDED");
    if (last.type === "NOTE_ADDED") {
      expect(last.payload.noteId).toBe(updated.notes[0].id);
    }
  });

  it("rejects empty notes", async () => {
    const { service } = buildService();
    const created = await service.create({ title: "T", submitter: "S" });
    await expect(
      service.addNote(created.id, { body: "" })
    ).rejects.toBeInstanceOf(DomainError);
    await expect(
      service.addNote(created.id, { body: "   " })
    ).rejects.toBeInstanceOf(DomainError);
  });
});

describe("RequestService.list filters", () => {
  async function seedFixtures() {
    const fixed = new Date("2026-06-15T12:00:00Z");
    const { service } = buildService(fixed);

    const a = await service.create({
      title: "A overdue in-review",
      submitter: "x",
      dueDate: "2026-06-10T00:00:00Z",
    });
    await service.changeStatus(a.id, { status: "IN_REVIEW" });
    await service.assignOwner(a.id, { owner: "jordan" });

    const b = await service.create({
      title: "B due soon new",
      submitter: "x",
      dueDate: "2026-06-18T00:00:00Z",
    });
    await service.assignOwner(b.id, { owner: "morgan" });

    const c = await service.create({
      title: "C on-track unassigned",
      submitter: "x",
      dueDate: "2026-08-01T00:00:00Z",
    });

    return { service };
  }

  it("filters by status", async () => {
    const { service } = await seedFixtures();
    const inReview = await service.list({ status: "IN_REVIEW" });
    expect(inReview.map((r) => r.title)).toEqual(["A overdue in-review"]);
  });

  it("filters by owner", async () => {
    const { service } = await seedFixtures();
    const morgansList = await service.list({ owner: "morgan" });
    expect(morgansList.map((r) => r.title)).toEqual(["B due soon new"]);
  });

  it("filters by unassigned", async () => {
    const { service } = await seedFixtures();
    const unassigned = await service.list({ owner: "unassigned" });
    expect(unassigned.map((r) => r.title)).toEqual(["C on-track unassigned"]);
  });

  it("filters by overdue", async () => {
    const { service } = await seedFixtures();
    const overdue = await service.list({ due: "overdue" });
    expect(overdue.map((r) => r.title)).toEqual(["A overdue in-review"]);
  });

  it("filters by due_soon", async () => {
    const { service } = await seedFixtures();
    const dueSoon = await service.list({ due: "due_soon" });
    expect(dueSoon.map((r) => r.title)).toEqual(["B due soon new"]);
  });

  it("supports free-text search", async () => {
    const { service } = await seedFixtures();
    const r = await service.list({ q: "OVERDUE" });
    expect(r.map((x) => x.title)).toEqual(["A overdue in-review"]);
  });
});
