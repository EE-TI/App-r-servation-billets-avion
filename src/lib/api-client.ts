import type { FlightOffer } from "./types";

export async function fetchFlights(params: {
  origin: string;
  destination: string;
  date?: string;
  passengers?: number;
}): Promise<{ flights: FlightOffer[]; source: string }> {
  const searchParams = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
  });
  if (params.date) searchParams.set("date", params.date);
  if (params.passengers) searchParams.set("passengers", String(params.passengers));

  const res = await fetch(`/api/flights?${searchParams.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function bookFlight(params: {
  offerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}): Promise<{ orderId: string; bookingRef: string }> {
  const res = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
