import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
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
    const supabaseService = createServiceRoleClient();
    const service = new BookingService(supabaseService);
    const booking = await service.getBookingByReference(ref.toUpperCase());

    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    // Authorization: 
    // If booking belongs to a customer, only that customer can view it.
    if (booking.customerId) {
      const supabaseAuth = await createClient();
      const { data: { user } } = await supabaseAuth.auth.getUser();
      if (!user || user.id !== booking.customerId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    // If booking.customerId is null (Guest), we allow access via PNR (Phase 1 behavior)

    return Response.json({ booking });
  } catch (err) {
    console.error("[GET /api/bookings/[ref]]", err);
    return Response.json(
      { error: "Failed to fetch booking." },
      { status: 500 }
    );
  }
}
