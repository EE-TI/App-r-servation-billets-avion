import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/flight-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { offerId, firstName, lastName, email, phone } = body;

    if (!offerId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "offerId, firstName, lastName et email sont requis" },
        { status: 400 },
      );
    }

    const result = await createOrder(offerId, { firstName, lastName, email, phone });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réservation" },
      { status: 500 },
    );
  }
}
