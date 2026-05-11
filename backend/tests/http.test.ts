import request from "supertest";
import { InMemoryRequestRepository } from "../src/repository/InMemoryRequestRepository";
import { RequestService } from "../src/services/RequestService";
import { buildApp } from "../src/http/server";

function buildHarness() {
  const repo = new InMemoryRequestRepository();
  const service = new RequestService(repo);
  const app = buildApp(service);
  return { app };
}

describe("HTTP API", () => {
  it("health endpoint responds", async () => {
    const { app } = buildHarness();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("creates, fetches, and lists requests", async () => {
    const { app } = buildHarness();

    const create = await request(app)
      .post("/api/requests")
      .send({ title: "T", submitter: "S", actor: "alice" });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const getOne = await request(app).get(`/api/requests/${id}`);
    expect(getOne.status).toBe(200);
    expect(getOne.body.dueState).toBe("NO_DUE_DATE");

    const list = await request(app).get("/api/requests");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body).toMatchObject({
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it("paginates the list endpoint", async () => {
    const { app } = buildHarness();
    for (let i = 0; i < 12; i++) {
      await request(app)
        .post("/api/requests")
        .send({ title: `T${i}`, submitter: "S" })
        .expect(201);
    }

    const page1 = await request(app).get("/api/requests?pageSize=5");
    expect(page1.status).toBe(200);
    expect(page1.body.data).toHaveLength(5);
    expect(page1.body).toMatchObject({
      page: 1,
      pageSize: 5,
      total: 12,
      totalPages: 3,
    });

    const page3 = await request(app).get("/api/requests?pageSize=5&page=3");
    expect(page3.body.data).toHaveLength(2);
    expect(page3.body.page).toBe(3);

    // Out-of-range page clamps to the last page rather than 404'ing
    const page99 = await request(app).get("/api/requests?pageSize=5&page=99");
    expect(page99.body.page).toBe(3);
    expect(page99.body.data).toHaveLength(2);
  });

  it("rejects invalid pagination params with 400", async () => {
    const { app } = buildHarness();
    const res = await request(app).get("/api/requests?page=0");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("invalid_request");
  });

  it("returns 422 with a typed code when business rules fail", async () => {
    const { app } = buildHarness();
    const create = await request(app)
      .post("/api/requests")
      .send({ title: "T", submitter: "S" });
    const id = create.body.id;

    await request(app)
      .patch(`/api/requests/${id}/status`)
      .send({ status: "IN_REVIEW" })
      .expect(200);

    const res = await request(app)
      .patch(`/api/requests/${id}/status`)
      .send({ status: "APPROVED" });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe("required_fields_incomplete");
  });

  it("returns 400 for malformed bodies", async () => {
    const { app } = buildHarness();
    const res = await request(app)
      .post("/api/requests")
      .send({ title: "" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("invalid_request");
  });

  it("returns 404 for unknown requests", async () => {
    const { app } = buildHarness();
    const res = await request(app).get("/api/requests/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("not_found");
  });

  it("history endpoint returns events ordered by time", async () => {
    const { app } = buildHarness();
    const create = await request(app)
      .post("/api/requests")
      .send({ title: "T", submitter: "S", requiredFieldsComplete: true });
    const id = create.body.id;

    await request(app)
      .patch(`/api/requests/${id}/owner`)
      .send({ owner: "morgan" })
      .expect(200);
    await request(app)
      .patch(`/api/requests/${id}/status`)
      .send({ status: "IN_REVIEW" })
      .expect(200);
    await request(app)
      .post(`/api/requests/${id}/notes`)
      .send({ body: "Looks good" })
      .expect(201);

    const history = await request(app).get(`/api/requests/${id}/history`);
    expect(history.status).toBe(200);
    expect(history.body.data.map((e: any) => e.type)).toEqual([
      "CREATED",
      "OWNER_CHANGED",
      "STATUS_CHANGED",
      "NOTE_ADDED",
    ]);
  });
});
