import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/flight-service";
import { isValidIata } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin")?.toUpperCase();
  const destination = searchParams.get("destination")?.toUpperCase();
  const date = searchParams.get("date") || undefined;
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const cabinClass = searchParams.get("cabin_class") || undefined;

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "Les paramètres origin et destination sont requis" },
      { status: 400 },
    );
  }

  if (!isValidIata(origin) || !isValidIata(destination)) {
    return NextResponse.json(
      { error: "Les codes IATA doivent être composés de 3 lettres majuscules" },
      { status: 400 },
    );
  }

  if (origin === destination) {
    return NextResponse.json(
      { error: "L'origine et la destination doivent être différentes" },
      { status: 400 },
    );
  }

  try {
    const flights = await searchFlights({
      origin,
      destination,
      date,
      passengers,
      cabinClass,
    });
    return NextResponse.json({ flights, source: process.env.DUFFEL_ACCESS_TOKEN ? "duffel" : "mock" });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche de vols" },
      { status: 500 },
    );
  }
}
