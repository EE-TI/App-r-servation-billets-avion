import "server-only";
import { Duffel } from "@duffel/api";
import type { FlightOffer, SearchParams } from "./types";

const USE_MOCK = !process.env.DUFFEL_ACCESS_TOKEN;

const duffel = USE_MOCK
  ? null
  : new Duffel({ token: process.env.DUFFEL_ACCESS_TOKEN! });

export async function searchFlights(params: SearchParams): Promise<FlightOffer[]> {
  if (USE_MOCK || !duffel) {
    return getMockFlights(params);
  }
  return getDuffelFlights(params);
}

async function getDuffelFlights(params: SearchParams): Promise<FlightOffer[]> {
  const response = await duffel!.offerRequests.create({
    slices: [
      {
        origin: params.origin,
        destination: params.destination,
        departure_date: params.date || new Date().toISOString().split("T")[0],
        departure_time: null,
        arrival_time: null,
      },
    ],
    passengers: Array.from({ length: params.passengers || 1 }, () => ({ type: "adult" as const })),
    cabin_class: (params.cabinClass as "economy") || "economy",
  });

  const offers = response.data.offers || [];

  return offers.slice(0, 20).map((offer): FlightOffer => {
    const slice = offer.slices[0];
    const firstSeg = slice.segments[0];
    const lastSeg = slice.segments[slice.segments.length - 1];

    return {
      id: offer.id,
      airline: {
        name: firstSeg.operating_carrier.name,
        iataCode: firstSeg.operating_carrier.iata_code || "",
        logoUrl: firstSeg.operating_carrier.logo_symbol_url || undefined,
      },
      departure: {
        airport: firstSeg.origin.iata_code || params.origin,
        at: firstSeg.departing_at,
      },
      arrival: {
        airport: lastSeg.destination.iata_code || params.destination,
        at: lastSeg.arriving_at,
      },
      durationMinutes: parseDuffelDuration(slice.duration || "PT0H"),
      stops: slice.segments.length - 1,
      price: {
        amount: parseFloat(offer.total_amount),
        currency: offer.total_currency,
      },
      cabinClass: (firstSeg.passengers?.[0]?.cabin_class || "economy") as FlightOffer["cabinClass"],
      co2Kg: offer.total_emissions_kg ? parseFloat(offer.total_emissions_kg) : undefined,
    };
  }).sort((a, b) => a.price.amount - b.price.amount);
}

function parseDuffelDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || "0") * 60) + parseInt(match[2] || "0");
}

async function getMockFlights(params: SearchParams): Promise<FlightOffer[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const airlines = [
    { name: "Air France", iataCode: "AF" },
    { name: "Lufthansa", iataCode: "LH" },
    { name: "British Airways", iataCode: "BA" },
    { name: "KLM", iataCode: "KL" },
  ];

  const baseDate = params.date || new Date().toISOString().split("T")[0];

  return Array.from({ length: 10 }).map((_, i) => {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const depHour = 5 + Math.floor(Math.random() * 16);
    const depMin = Math.random() > 0.5 ? 0 : 30;
    const durationMin = 60 + Math.floor(Math.random() * 600);
    const arrDate = new Date(`${baseDate}T${String(depHour).padStart(2, "0")}:${String(depMin).padStart(2, "0")}:00`);
    arrDate.setMinutes(arrDate.getMinutes() + durationMin);
    const stops = Math.random() > 0.6 ? (Math.random() > 0.7 ? 2 : 1) : 0;

    return {
      id: `${airline.iataCode}-${1000 + i}`,
      airline: {
        name: airline.name,
        iataCode: airline.iataCode,
        logoUrl: `/airlines/${airline.name.toLowerCase().replace(/ /g, "-")}.svg`,
      },
      departure: {
        airport: params.origin.toUpperCase(),
        at: `${baseDate}T${String(depHour).padStart(2, "0")}:${String(depMin).padStart(2, "0")}:00`,
      },
      arrival: {
        airport: params.destination.toUpperCase(),
        at: arrDate.toISOString().replace("Z", ""),
      },
      durationMinutes: durationMin,
      stops,
      price: {
        amount: 49 + Math.floor(Math.random() * 750),
        currency: "EUR",
      },
      cabinClass: "economy" as const,
      aircraft: ["Airbus A320", "Boeing 737", "Airbus A350", "Boeing 787"][Math.floor(Math.random() * 4)],
      co2Kg: 50 + Math.floor(Math.random() * 200),
    };
  }).sort((a, b) => a.price.amount - b.price.amount);
}

export async function createOrder(offerId: string, passenger: { firstName: string; lastName: string; email: string; phone?: string }): Promise<{ orderId: string; bookingRef: string }> {
  if (USE_MOCK || !duffel) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      orderId: `mock-${crypto.randomUUID().slice(0, 8)}`,
      bookingRef: `SKV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
  }

  const order = await duffel!.orders.create({
    type: "instant",
    selected_offers: [offerId],
    payments: [{ type: "balance", amount: "0", currency: "EUR" }],
    passengers: [
      {
        id: "pas_0",
        given_name: passenger.firstName,
        family_name: passenger.lastName,
        email: passenger.email,
        phone_number: passenger.phone || "",
        born_on: "1990-01-01",
        title: "mr",
        gender: "m",
      },
    ],
  });

  return {
    orderId: order.data.id,
    bookingRef: order.data.booking_reference || order.data.id,
  };
}
