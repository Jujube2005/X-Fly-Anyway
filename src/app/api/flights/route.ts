import { NextResponse } from "next/server";

/** GET /api/flights — Search available flights */
export async function GET(request: Request) {
  // TODO: implement flight search via flight.service.ts
  return NextResponse.json({ message: "flights endpoint — TODO" });
}
