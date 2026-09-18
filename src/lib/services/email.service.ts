export class EmailService {
  /**
   * Mock sending a booking confirmation email.
   * In a real application, this would integrate with Resend, SendGrid, etc.
   */
  static async sendBookingConfirmation(email: string, reference: string, firstName: string) {
    console.log(`
======================================================
[MOCK EMAIL SERVICE] - Sending Booking Confirmation
To: ${email}
Subject: Your X-Fly Anyway Booking Confirmed! (${reference})
======================================================
Dear ${firstName},

Thank you for choosing X-Fly Anyway! Your flight is confirmed.
Your Booking Reference (PNR) is: ${reference}

You can view your E-Ticket, manage your booking, or cancel it via the link below:
http://localhost:3000/manage

Safe travels!
- The X-Fly Anyway Team
======================================================
`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
