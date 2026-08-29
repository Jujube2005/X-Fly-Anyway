import { NextResponse } from "next/server";

/** POST /api/bookings — Create a new booking */
export async function POST(request: Request) {
  // TODO: implement booking creation via booking.service.ts
  return NextResponse.json({ message: "bookings endpoint — TODO" });
}

/** GET /api/bookings — List bookings (admin) */
export async function GET(request: Request) {
  // TODO: implement booking list via booking.service.ts
  return NextResponse.json({ message: "bookings list endpoint — TODO" });
}
