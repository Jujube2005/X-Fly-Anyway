import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { queryBookingByRef, queryPassengersByBooking } from "@/lib/supabase/queries";
import { z } from "zod";

// Normalize and validate
const findBookingSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(1)
    .regex(/^XFA-\d{8}-[A-Z0-9]{4}$/i, "Invalid Booking Reference format"),
  lastName: z.string().trim().min(1, "Last name is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = findBookingSchema.safeParse(body);

    if (!result.success) {
      // Return generic error to prevent enumeration or detailed feedback on format
      return NextResponse.json(
        { error: "Booking Reference or Last Name is incorrect." },
        { status: 401 }
      );
    }

    const { reference, lastName } = result.data;
    const normalizedRef = reference.toUpperCase();
    const normalizedLastName = lastName.toLowerCase();

    const supabaseService = createServiceRoleClient();

    // 1. Check if booking exists
    const { data: booking, error: bookingError } = await queryBookingByRef(supabaseService, normalizedRef);

    if (bookingError || !booking) {
      // GENERIC ERROR: PNR not found
      return NextResponse.json(
        { error: "Booking Reference or Last Name is incorrect." },
        { status: 401 }
      );
    }


    // 2. Booking exists. Check if last name matches Contact
    const isContactMatch = booking.contact_last_name.trim().toLowerCase() === normalizedLastName;

    // 3. If not contact, check if last name matches any Passenger
    let isPassengerMatch = false;
    if (!isContactMatch) {
      const { data: passengers, error: passengerError } = await queryPassengersByBooking(supabaseService, booking.id);
      
      if (!passengerError && passengers) {
        isPassengerMatch = passengers.some(
          (p) => p.last_name.trim().toLowerCase() === normalizedLastName
        );
      }
    }

    // 4. Verify match
    if (!isContactMatch && !isPassengerMatch) {
      // GENERIC ERROR: PNR found, but Last Name mismatch
      return NextResponse.json(
        { error: "Booking Reference or Last Name is incorrect." },
        { status: 401 }
      );
    }

    // 5. Success! Return minimal data for navigation.
    return NextResponse.json({
      success: true,
      reference: booking.reference,
    });

  } catch (err: any) {
    console.error("[ManageBooking] API Error:", err);
    return NextResponse.json(
      { error: "Booking Reference or Last Name is incorrect." },
      { status: 401 }
    );
  }
}
