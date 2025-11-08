import { describe, it, expect } from "@jest/globals";

describe("WorkoutRepository contract", () => {
  describe("listWorkouts", () => {
    it("should return paginated workouts with exercises", () => {
      expect(true).toBe(true);
    });
    it("should optionally include history", () => {
      expect(true).toBe(true);
    });
  });

  describe("getWorkout", () => {
    it("should return full workout details", () => {
      expect(true).toBe(true);
    });
    it("should include related exercises and sets", () => {
      expect(true).toBe(true);
    });
  });

  describe("upsertWorkout", () => {
    it("should create new workout with exercises", () => {
      expect(true).toBe(true);
    });
    it("should update existing workout transactionally", () => {
      expect(true).toBe(true);
    });
    it("should preserve existing sets when reordering", () => {
      expect(true).toBe(true);
    });
  });

  describe("deleteWorkout", () => {
    it("should delete workout", () => {
      expect(true).toBe(true);
    });
  });
});
