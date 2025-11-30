import request from "supertest";
import app from "../src/app";
import { string } from "zod";

describe("POST /bookings", () => {
  // Utilidad para request base
  const postBooking = (body: any, idempotencyKey: string) =>
    request(app)
      .post("/woki/bookings")
      .set("Idempotency-Key", idempotencyKey)
      .send(body);

  const basePayload = {
    restaurantId: "R1",
    sectorId: "S1",
    date: "2025-11-30",
    partySize: 5,
    durationMinutes: 60,
    windowStart: "12:00",
    windowEnd: "14:00",
  };

  it("Happy single: should find a perfect gap on a single table", async () => {
    const res = await postBooking(basePayload, "single-1");

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.tableIds).toHaveLength(1);
    expect(res.body.status).toBe("CONFIRMED");
  });

  it("Happy combo: should find valid combination when single tables cannot fit", async () => {
    const payload = { ...basePayload, partySize: 7 };

    const res = await postBooking(payload, "key-combo-1");

    expect(res.status).toBe(201);
    expect(res.body.tableIds.length).toBeGreaterThan(1);
  });

  it("Boundary: bookings touching at end are accepted (end-exclusive)", async () => {
    // First reservation: [20:00–21:00)
    const res1 = await postBooking(
      {
        ...basePayload,
        windowStart: "20:00",
        windowEnd: "21:00",
      },
      "idp-boundary-existing"
    );

    expect(res1.status).toBe(201);

    // Next reservation: [21:00–22:00)
    const res2 = await postBooking(
      {
        ...basePayload,
        windowStart: "21:00",
        windowEnd: "22:00",
      },
      "idp-boundary-new"
    );

    expect(res2.status).toBe(201);
  });

  it("Idempotency: same payload and Idempotency key returns the same booking", async () => {
    const key = "idempo-123";

    const first = await postBooking(basePayload, key);
    const second = await postBooking(basePayload, key);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);
  });

  it("Outside hours: should return 422 when window is outside service hours", async () => {
    const res = await postBooking(
      {
        ...basePayload,
        windowStart: "07:00", // fuera de horario
        windowEnd: "08:00",
      },
      "outside-1"
    );

    expect(res.status).toBe(422);
  });

  // it("Concurrency: two parallel creates → one 201, one 409", async () => {
  //   const payload = {
  //     ...basePayload,
  //     windowStart: "12:00",
  //     windowEnd: "13:00",
  //   };

  //   const req1 = postBooking(payload, "conc-1");
  //   const req2 = postBooking(payload, "conc-2");

  //   const [res1, res2] = await Promise.all([req1, req2]);

  //   const statuses = [res1.status, res2.status].sort();

  //   expect(statuses).toEqual([201, 409]);
  // });
});
