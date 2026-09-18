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

  if (!ref || ref === "undefined" || !/^XFA-\d{8}-[A-Z0-9]{4}$/i.test(ref)) {
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

    if (booking.status !== "confirmed" && booking.status !== "cancelled") {
      return Response.json(
        { error: "E-ticket is only available for confirmed bookings." },
        { status: 403 }
      );
    }

    const [payment, flights, eTicketRes] = await Promise.all([
      paymentService.getPaymentByBookingId(booking.id),
      Promise.all(booking.flightIds.map((id) => flightService.getFlightById(id))),
      supabase.from("e_ticket").select("id, issued_at").eq("booking_id", booking.id).maybeSingle(),
    ]);

    const firstFlight = flights[0];
    const ticketBooking = {
      reference: booking.reference,
      status: booking.status,
      cabinClass: booking.cabinClass,
      passengers: booking.passengers,
      flight: firstFlight
        ? {
            flightNumber: firstFlight.flightNumber,
            originCode: firstFlight.origin?.airport_code ?? "—",
            originCity: firstFlight.origin?.city ?? "—",
            originName: firstFlight.origin?.name ?? "—",
            destinationCode: firstFlight.destination?.airport_code ?? "—",
            destinationCity: firstFlight.destination?.city ?? "—",
            destinationName: firstFlight.destination?.name ?? "—",
            departureAt: firstFlight.departureAt,
            arrivalAt: firstFlight.arrivalAt,
          }
        : null,
      seats: (booking.seatNumbers.flat() || []).map((seatNumber) => ({ seatNumber })),
      seatNumbers: booking.seatNumbers,
      flightIds: booking.flightIds,
    };

    const eTicketData = eTicketRes.data as { id?: string; issued_at?: string } | null;

    // Return ticket data for client-side rendering / print view
    return Response.json({
      ticket: {
        id: eTicketData?.id ?? booking.id,
        ticketCode: `ETK-${booking.reference}`,
        eTicketId: eTicketData?.id ?? null,
        bookingId: booking.id,
        issuedAt: eTicketData?.issued_at ?? booking.createdAt ?? new Date().toISOString(),
        booking: ticketBooking,
        flights,
        payment,
      },
    });
  } catch (err) {
    console.error("[GET /api/tickets/[ref]]", err);
    return Response.json({ error: "Failed to generate ticket." }, { status: 500 });
  }
}
