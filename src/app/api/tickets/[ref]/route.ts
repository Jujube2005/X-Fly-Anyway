import { createClient } from "@/lib/supabase/server";
import { BookingService } from "@/lib/services/booking.service";
import { PaymentService } from "@/lib/services/payment.service";
import { FlightService } from "@/lib/services/flight.service";

/**
 * GET /api/tickets/[ref]
 *
 * Stream a PDF e-ticket for a confirmed booking.
 * FR-CUS-013: Download e-ticket as PDF.
 *
 * Note: @react-pdf/renderer runs server-side only.
 * This route is installed after the PDF library is added (Step 7).
 * For now it returns booking data as JSON so the UI can render a print view.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  if (!/^XFA-\d{8}-[A-Z2-9]{4}$/.test(ref?.toUpperCase() ?? "")) {
    return Response.json({ error: "Invalid booking reference" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const bookingService = new BookingService(supabase);
    const paymentService = new PaymentService(supabase);
    const flightService = new FlightService(supabase);

    const booking = await bookingService.getBookingByReference(ref.toUpperCase());
    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "confirmed") {
      return Response.json(
        { error: "E-ticket is only available for confirmed bookings." },
        { status: 403 }
      );
    }

    const [payment, flight] = await Promise.all([
      paymentService.getPaymentByBookingId(booking.id),
      flightService.getFlightById(booking.flightId),
    ]);

    // Return ticket data for client-side rendering / print view
    // PDF generation will be added in Step 7 (PDF library install)
    return Response.json({
      ticket: {
        booking,
        payment,
        flight,
        issuedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[GET /api/tickets/[ref]]", err);
    return Response.json({ error: "Failed to generate ticket." }, { status: 500 });
  }
}
