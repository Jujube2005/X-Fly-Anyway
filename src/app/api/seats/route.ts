import { NextResponse } from "next/server";

/** GET /api/seats — Get seat map for a flight */
export async function GET(request: Request) {
  // TODO: implement seat map retrieval via seat.service.ts
  return NextResponse.json({ message: "seats endpoint — TODO" });
}
