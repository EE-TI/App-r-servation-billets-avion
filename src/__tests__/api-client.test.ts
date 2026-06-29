import { describe, it, expect, vi, beforeEach } from "vitest";

describe("api-client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetchFlights constructs correct URL and parses response", async () => {
    const mockResponse = {
      flights: [
        {
          id: "AF-1000",
          airline: { name: "Air France", iataCode: "AF" },
          departure: { airport: "CDG", at: "2026-07-15T08:30:00" },
          arrival: { airport: "JFK", at: "2026-07-15T15:45:00" },
          durationMinutes: 435,
          stops: 0,
          price: { amount: 312, currency: "EUR" },
          cabinClass: "economy",
        },
      ],
      source: "mock",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const { fetchFlights } = await import("@/lib/api-client");
    const result = await fetchFlights({ origin: "CDG", destination: "JFK" });

    expect(result.flights).toHaveLength(1);
    expect(result.flights[0].price.currency).toBe("EUR");
    expect(result.source).toBe("mock");

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    expect(fetchCall[0]).toContain("/api/flights");
    expect(fetchCall[0]).toContain("origin=CDG");
    expect(fetchCall[0]).toContain("destination=JFK");
  });

  it("fetchFlights throws on error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "Invalid IATA code" }),
    } as unknown as Response);

    const { fetchFlights } = await import("@/lib/api-client");
    await expect(fetchFlights({ origin: "XX", destination: "YY" })).rejects.toThrow("Invalid IATA code");
  });

  it("bookFlight sends POST with correct body", async () => {
    const mockResult = { orderId: "ord-123", bookingRef: "SKV-ABC" };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResult),
    } as Response);

    const { bookFlight } = await import("@/lib/api-client");
    const result = await bookFlight({
      offerId: "offer-1",
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean@test.com",
    });

    expect(result.orderId).toBe("ord-123");
    expect(result.bookingRef).toBe("SKV-ABC");

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    expect(fetchCall[0]).toBe("/api/book");
    expect(fetchCall[1]?.method).toBe("POST");
  });
});
