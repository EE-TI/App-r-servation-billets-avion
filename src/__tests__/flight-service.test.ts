import { describe, it, expect } from "vitest";
import { isValidIata, formatDuration } from "@/lib/types";
import { airports, popularDestinations } from "@/lib/data";

describe("types", () => {
  describe("isValidIata", () => {
    it("accepts valid 3-letter codes", () => {
      expect(isValidIata("CDG")).toBe(true);
      expect(isValidIata("JFK")).toBe(true);
      expect(isValidIata("YUL")).toBe(true);
    });

    it("rejects invalid codes", () => {
      expect(isValidIata("cd")).toBe(false);
      expect(isValidIata("CDGX")).toBe(false);
      expect(isValidIata("123")).toBe(false);
      expect(isValidIata("")).toBe(false);
      expect(isValidIata("cdg")).toBe(false);
    });
  });

  describe("formatDuration", () => {
    it("formats minutes to human readable", () => {
      expect(formatDuration(90)).toBe("1h 30");
      expect(formatDuration(60)).toBe("1h 00");
      expect(formatDuration(135)).toBe("2h 15");
      expect(formatDuration(0)).toBe("0h 00");
      expect(formatDuration(450)).toBe("7h 30");
    });
  });
});

describe("airports", () => {
  it("has valid airport entries with 3-letter IATA codes", () => {
    expect(airports.length).toBeGreaterThan(0);
    for (const a of airports) {
      expect(isValidIata(a.code)).toBe(true);
      expect(a.city).toBeTruthy();
      expect(a.name).toBeTruthy();
    }
  });

  it("has no duplicate codes", () => {
    const codes = airports.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("popularDestinations", () => {
  it("has valid destinations with matching airport codes", () => {
    expect(popularDestinations.length).toBe(6);
    for (const d of popularDestinations) {
      expect(isValidIata(d.code)).toBe(true);
      expect(d.city).toBeTruthy();
      expect(d.gradient).toContain("from-");
    }
  });
});
