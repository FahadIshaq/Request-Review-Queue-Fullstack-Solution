import { canTransitionTo, dueState } from "../src/domain/rules";

describe("canTransitionTo", () => {
  it("rejects approving when required fields are incomplete", () => {
    const r = canTransitionTo({
      current: "IN_REVIEW",
      next: "APPROVED",
      requiredFieldsComplete: false,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("required_fields_incomplete");
  });

  it("allows approving when required fields are complete", () => {
    const r = canTransitionTo({
      current: "IN_REVIEW",
      next: "APPROVED",
      requiredFieldsComplete: true,
    });
    expect(r.ok).toBe(true);
  });

  it("rejects rejecting without a rejection reason", () => {
    const r = canTransitionTo({
      current: "IN_REVIEW",
      next: "REJECTED",
      requiredFieldsComplete: true,
      rejectionReason: "",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("rejection_reason_required");
  });

  it("rejects rejecting when reason is whitespace only", () => {
    const r = canTransitionTo({
      current: "IN_REVIEW",
      next: "REJECTED",
      requiredFieldsComplete: true,
      rejectionReason: "   ",
    });
    expect(r.ok).toBe(false);
  });

  it("allows rejecting when a non-empty reason is provided", () => {
    const r = canTransitionTo({
      current: "IN_REVIEW",
      next: "REJECTED",
      requiredFieldsComplete: false,
      rejectionReason: "Out of policy.",
    });
    expect(r.ok).toBe(true);
  });

  it("rejects illegal transitions (APPROVED is terminal)", () => {
    const r = canTransitionTo({
      current: "APPROVED",
      next: "IN_REVIEW",
      requiredFieldsComplete: true,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("invalid_transition");
  });

  it("rejects no-op transitions", () => {
    const r = canTransitionTo({
      current: "NEW",
      next: "NEW",
      requiredFieldsComplete: true,
    });
    expect(r.ok).toBe(false);
  });
});

describe("dueState", () => {
  const fixed = new Date("2026-06-15T12:00:00Z");

  it("returns NO_DUE_DATE when dueDate is missing", () => {
    expect(dueState({ dueDate: null, status: "NEW" }, fixed)).toBe("NO_DUE_DATE");
  });

  it("returns OVERDUE for past dates on non-terminal requests", () => {
    expect(
      dueState({ dueDate: "2026-06-10T00:00:00Z", status: "IN_REVIEW" }, fixed)
    ).toBe("OVERDUE");
  });

  it("returns DUE_SOON for dates within 7 days", () => {
    expect(
      dueState({ dueDate: "2026-06-18T00:00:00Z", status: "IN_REVIEW" }, fixed)
    ).toBe("DUE_SOON");
  });

  it("returns ON_TRACK beyond the 7-day window", () => {
    expect(
      dueState({ dueDate: "2026-07-01T00:00:00Z", status: "NEW" }, fixed)
    ).toBe("ON_TRACK");
  });

  it("treats terminal statuses as ON_TRACK regardless of past dates", () => {
    expect(
      dueState({ dueDate: "2020-01-01T00:00:00Z", status: "APPROVED" }, fixed)
    ).toBe("ON_TRACK");
  });
});
