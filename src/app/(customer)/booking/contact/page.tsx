"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Button } from "@/components/ui/Button";
import { useBookingContext, type ContactInput } from "@/components/booking/BookingProvider";
import "./page.css";

const inputCls = "w-full bg-white/10 border border-white/30 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f5c800] focus:ring-1 focus:ring-[#f5c800] transition-all backdrop-blur-sm";

export default function ContactPage() {
  const router = useRouter();
  const { contact: existing, setContact } = useBookingContext();

  const [form, setForm] = useState<ContactInput>(
    existing ?? { firstName: "", lastName: "", email: "", phone: "" }
  );

  function update(field: keyof ContactInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContact(form);
    router.push("/booking/summary");
  }

  return (
    <div className="min-h-dvh flex flex-col contact-page-container">
      <Header variant="transparent" />

      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-2xl rounded-3xl px-8 py-10 contact-card-glass">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Information</h1>
          <p className="text-sm text-white/50 mb-6">
            Your booking confirmation will be sent to this contact.
          </p>

          <div className="mb-6">
            <BookingStepper currentLabel="Contact" variant="dark" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="First Name"
                required
                className={inputCls}
                aria-label="Contact first name"
              />
              <input
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="Last Name"
                required
                className={inputCls}
                aria-label="Contact last name"
              />
            </div>

            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Email Address"
              required
              className={inputCls}
              aria-label="Contact email"
            />

            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Phone Number"
              required
              className={inputCls}
              aria-label="Contact phone"
            />

            <div className="flex items-center justify-between pt-4">
              <Button variant="secondary" onClick={() => router.back()} type="button">
                ← Back
              </Button>
              <Button type="submit">
                Review Booking →
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
