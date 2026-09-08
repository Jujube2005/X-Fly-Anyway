import { NextResponse } from "next/server";

/** POST /api/payments — Process mock payment */
export async function POST(_request: Request) {
  // TODO: implement mock payment processing via payment.service.ts
  return NextResponse.json({ message: "payments endpoint — TODO" });
}
