"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Button } from "@/components/ui/Button";
import { useBookingContext, type ContactInput } from "@/components/booking/BookingProvider";
import { useTranslation } from "@/hooks/useTranslation";
import "./page.css";

const inputCls = "glass-input w-full px-4 py-3 text-sm text-[#111827] placeholder:text-slate-600 appearance-none";

export default function ContactPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
    <div
      className="min-h-dvh flex flex-col bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: 'url("/images/BG/Cloud.png")' }}
    >
      <div className="absolute inset-0 backdrop-blur-xs" />

      <div className="relative z-10 flex flex-col min-h-dvh">
        <Header variant="glass" />

        <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
          <div className="w-full max-w-2xl px-8 py-10 glass-card">
            <h1 className="text-3xl font-bold text-[#111827] mb-2 glass-text-contrast">
              {t.booking?.summary?.contact ?? "Contact Information"}
            </h1>

            <div className="mb-6 glass-panel p-4">
              <BookingStepper currentLabel="Contact" variant="light" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wide drop-shadow-sm">
                  {t.booking?.contact?.subtitle ?? "Your booking confirmation will be sent to this contact."}
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      placeholder={t.booking?.contact?.firstName ?? "First Name"}
                      required
                      className={inputCls}
                      aria-label={t.booking?.contact?.firstName ?? "Contact first name"}
                    />
                    <input
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      placeholder={t.booking?.contact?.lastName ?? "Last Name"}
                      required
                      className={inputCls}
                      aria-label={t.booking?.contact?.lastName ?? "Contact last name"}
                    />
                  </div>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder={t.booking?.contact?.email ?? "Email Address"}
                    required
                    className={inputCls}
                    aria-label={t.booking?.contact?.email ?? "Contact email"}
                  />

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder={t.booking?.contact?.phone ?? "Phone Number"}
                    required
                    className={inputCls}
                    aria-label={t.booking?.contact?.phone ?? "Contact phone"}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="secondary" onClick={() => router.back()} type="button" className="glass-button text-[#111827] border-0">
                  {t.booking?.contact?.back ?? "← Back"}
                </Button>
                <Button type="submit" className="bg-[#f5c800] text-slate-950 hover:bg-[#e6bb00] shadow-md border-0">
                  {t.booking?.contact?.reviewBooking ?? "Review Booking →"}
                </Button>
              </div>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-400/30">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-6 text-xs text-slate-800 font-medium drop-shadow-sm">
            <span>{t.home?.footer?.privacy ?? "Privacy Policy"}</span>
            <span>{t.home?.footer?.terms ?? "Terms of Service"}</span>
            <span>{t.home?.footer?.support ?? "Support"}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
