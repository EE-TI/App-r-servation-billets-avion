export interface Airline {
  name: string;
  iataCode: string;
  logoUrl?: string;
}

export interface FlightOffer {
  id: string;
  airline: Airline;
  departure: { airport: string; at: string };
  arrival: { airport: string; at: string };
  durationMinutes: number;
  stops: number;
  price: { amount: number; currency: string };
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  aircraft?: string;
  co2Kg?: number;
}

export interface SearchParams {
  origin: string;
  destination: string;
  date?: string;
  passengers?: number;
  cabinClass?: string;
}

export interface Trip {
  id: string;
  orderId?: string;
  from: string;
  to: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  passengerName: string;
  seat: string;
  gate: string;
  ticketId: string;
  bookedAt: string;
  status: "upcoming" | "completed" | "cancelled";
}

export interface Airport {
  code: string;
  city: string;
  name: string;
}

export interface Destination {
  city: string;
  country: string;
  code: string;
  emoji: string;
  gradient: string;
}

export function isValidIata(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}`;
}
