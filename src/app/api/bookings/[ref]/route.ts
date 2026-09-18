import { createClient } from "@/lib/supabase/server";
import { BookingService } from "@/lib/services/booking.service";

/**
 * GET /api/bookings/[ref]
 *
 * Get booking by reference code — used in confirmation and ticket pages.
 * FR-CUS-012: Customer can retrieve booking by reference.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  if (!ref) {
    return Response.json({ error: "Booking reference is required" }, { status: 400 });
  }

  // Validate reference format: XFA-YYYYMMDD-XXXX
  if (!/^XFA-\d{8}-[A-Z0-9]{4}$/i.test(ref)) {
    return Response.json(
      { error: "Invalid booking reference format" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const service = new BookingService(supabase);
    const booking = await service.getBookingByReference(ref.toUpperCase());

    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    return Response.json({ booking });
  } catch (err) {
    console.error("[GET /api/bookings/[ref]]", err);
    return Response.json(
      { error: "Failed to fetch booking." },
      { status: 500 }
    );
  }
}
