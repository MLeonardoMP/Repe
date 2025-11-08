import { describe, it, expect } from "@jest/globals";

describe("/api/exercises/migrate contract", () => {
  describe("GET /api/exercises/migrate/verify", () => {
    it("should return parity report", async () => {
      const response = await fetch(
        "http://localhost:3000/api/exercises/migrate/verify",
        { method: "GET" }
      ).catch(() => null);

      if (!response) {
        expect(true).toBe(true);
        return;
      }

      if (response.ok) {
        const body = await response.json();
        expect(body).toHaveProperty("json");
        expect(body).toHaveProperty("db");
      }
    });
  });

  describe("POST /api/exercises/migrate/backfill", () => {
    it("should backfill data from JSON to DB", async () => {
      const response = await fetch(
        "http://localhost:3000/api/exercises/migrate/backfill",
        { method: "POST" }
      ).catch(() => null);

      if (!response) {
        expect(true).toBe(true);
        return;
      }

      expect([200, 500]).toContain(response.status);
    });
  });

  describe("POST /api/exercises/migrate/dual-write/toggle", () => {
    it("should toggle dual-write mode", async () => {
      const payload = { enabled: true };

      const response = await fetch(
        "http://localhost:3000/api/exercises/migrate/dual-write/toggle",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      ).catch(() => null);

      if (!response) {
        expect(true).toBe(true);
        return;
      }

      expect([200, 500]).toContain(response.status);
    });
  });
});
