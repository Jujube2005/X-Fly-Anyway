import { createClient } from "@/lib/supabase/server";
import { BookingService } from "@/lib/services/booking.service";
import { NextResponse } from "next/server";

/**
 * POST /api/bookings/[ref]/cancel
 *
 * Cancels a booking and initiates a full refund process.
 * FR-CUS-015: 24h before departure rule (enforced in BookingService).
 * FR-CUS-016: Cancellation processing.
 * FR-CUS-017: Refund status tracking.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  if (!ref) {
    return NextResponse.json({ error: "Booking reference is required" }, { status: 400 });
  }

  // Validate reference format: XFA-YYYYMMDD-XXXX
  if (!/^XFA-\d{8}-[A-Z0-9]{4}$/i.test(ref)) {
    return NextResponse.json(
      { error: "Invalid booking reference format" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const reason = body.reason;

    const supabase = await createClient();
    const service = new BookingService(supabase);
    
    const result = await service.cancelBookingWithRefund(ref, reason);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[POST /api/bookings/[ref]/cancel]", err);
    
    // Check for specific known business logic errors to return 400 instead of 500
    if (err instanceof Error) {
      if (
        err.message.includes("Cancellation is only permitted") || 
        err.message.includes("already been cancelled") ||
        err.message.includes("Cannot cancel booking in status")
      ) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      if (err.message.includes("Booking not found")) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to cancel booking." },
      { status: 500 }
    );
  }
}
