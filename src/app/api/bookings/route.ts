import { createClient } from "@/lib/supabase/server";
import { BookingService } from "@/lib/services/booking.service";
import { SeatService } from "@/lib/services/seat.service";
import { PaymentService } from "@/lib/services/payment.service";
import type { CreateBookingPayload } from "@/types/booking";
import type { MockPaymentPayload } from "@/types/payment";

/**
 * POST /api/bookings
 *
 * Create a booking, reserve seats, and process mock payment atomically.
 * FR-CUS-008 → FR-CUS-011: Full booking + payment flow.
 *
 * Request body:
 * {
 *   booking: CreateBookingPayload,
 *   payment: { method, card? }
 * }
 *
 * Response (success):
 * { booking, payment, reference }
 *
 * Response (payment failure):
 * { error: "Payment failed", reason: "...", bookingRef: "..." }
 *   — booking is cancelled, seats released
 */
export async function POST(request: Request) {
  let body: {
    booking: CreateBookingPayload;
    payment: Pick<MockPaymentPayload, "method" | "card">;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { booking: bookingPayload, payment: paymentInput } = body;

  // Validate required fields
  if (
    !bookingPayload?.flightIds ||
    !bookingPayload.flightIds.length ||
    !bookingPayload?.cabinClass ||
    !bookingPayload?.passengers?.length ||
    !bookingPayload?.contact?.email ||
    !bookingPayload?.seatNumbers?.length ||
    !paymentInput?.method
  ) {
    return Response.json(
      {
        error:
          "Missing required fields: booking.flightIds, cabinClass, passengers, contact, seatNumbers, payment.method",
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const bookingService = new BookingService(supabase);
  const seatService = new SeatService(supabase);
  const paymentService = new PaymentService(supabase);

  let bookingId: string | null = null;

  try {
    // Step 1: Create booking record (status: 'pending')
    const booking = await bookingService.createBooking(bookingPayload);
    bookingId = booking.id;

    // Step 2 & 3: Reserve seats and decrement availability per leg
    for (let i = 0; i < bookingPayload.flightIds.length; i++) {
      const flightId = bookingPayload.flightIds[i];
      const legSeats = bookingPayload.seatNumbers[i];
      if (!legSeats || legSeats.length === 0) continue;

      // Reserve seats (marks as 'occupied', inserts booking_seat)
      // Throws on race condition (unique constraint violation)
      await seatService.reserveSeats(flightId, legSeats, booking.id);

      // Decrement available_seats counter
      await seatService.decrementAvailableSeats(
        flightId,
        bookingPayload.cabinClass,
        legSeats.length
      );
    }

    // Step 4: Process mock payment
    const paymentPayload: MockPaymentPayload = {
      bookingId: booking.id,
      amount:    booking.totalAmount,
      currency:  booking.currency,
      method:    paymentInput.method,
      card:      paymentInput.card,
    };
    const payment = await paymentService.processMockPayment(paymentPayload);

    if (payment.status === "success") {
      // Step 5a: Confirm booking + issue e-ticket
      await bookingService.confirmBooking(booking.id);

      return Response.json(
        {
          booking:   { ...booking, status: "confirmed" },
          payment,
          reference: booking.reference,
        },
        { status: 201 }
      );
    } else {
      // Step 5b: Payment failed — cancel booking and release seats
      await bookingService.cancelBooking(booking.id);
      await seatService.releaseSeats(booking.id);
      for (let i = 0; i < bookingPayload.flightIds.length; i++) {
        const flightId = bookingPayload.flightIds[i];
        const legSeats = bookingPayload.seatNumbers[i];
        if (legSeats && legSeats.length > 0) {
          await seatService.incrementAvailableSeats(flightId, bookingPayload.cabinClass, legSeats.length);
        }
      }

      return Response.json(
        {
          error:      "Payment failed",
          reason:     "Payment was declined. Please check your card details and try again.",
          bookingRef: booking.reference,
        },
        { status: 402 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/bookings]", message);

    // Cleanup: if booking was created but something else failed, cancel it
    if (bookingId) {
      try {
        await bookingService.cancelBooking(bookingId);
        await seatService.releaseSeats(bookingId);
        for (let i = 0; i < bookingPayload.flightIds.length; i++) {
          const flightId = bookingPayload.flightIds[i];
          const legSeats = bookingPayload.seatNumbers[i];
          if (legSeats && legSeats.length > 0) {
            await seatService.incrementAvailableSeats(flightId, bookingPayload.cabinClass, legSeats.length);
          }
        }
      } catch (cleanupErr) {
        console.error("[POST /api/bookings] cleanup failed:", cleanupErr);
      }
    }

    // Seat conflict (race condition)
    if (message.includes("Seat already booked") || message.includes("not available")) {
      return Response.json(
        {
          error:  "Seat conflict",
          reason: message,
        },
        { status: 409 }
      );
    }

    return Response.json(
      { error: "Booking failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings
 *
 * List all bookings — admin only.
 * Proxy (proxy.ts) enforces /admin/* authentication, but this route
 * is also accessible to server components so we don't add extra auth here.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const service = new BookingService(supabase);
    const bookings = await service.listBookings();
    return Response.json({ bookings });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return Response.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }
}
