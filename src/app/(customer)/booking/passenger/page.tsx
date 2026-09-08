"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Button } from "@/components/ui/Button";
import { useBookingContext, type PassengerInput } from "@/components/booking/BookingProvider";

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
  { value: "Master", label: "Master" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unspecified", label: "Prefer not to say" },
];

const COMMON_NATIONALITIES = [
  { value: "TH", label: "Thai" },
  { value: "US", label: "American" },
  { value: "GB", label: "British" },
  { value: "JP", label: "Japanese" },
  { value: "CN", label: "Chinese" },
  { value: "SG", label: "Singaporean" },
  { value: "AU", label: "Australian" },
  { value: "DE", label: "German" },
  { value: "FR", label: "French" },
  { value: "KR", label: "Korean" },
  { value: "IN", label: "Indian" },
  { value: "AE", label: "Emirati" },
];

function emptyPassenger(): PassengerInput {
  return { title: "Mr", firstName: "", lastName: "", dateOfBirth: "", gender: "male", nationality: "TH" };
}

const inputCls = "w-full bg-white/10 border border-white/30 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f5c800] focus:ring-1 focus:ring-[#f5c800] transition-all backdrop-blur-sm appearance-none";

export default function PassengerPage() {
  const router = useRouter();
  const { passengerCount, setPassengers } = useBookingContext();

  const [forms, setForms] = useState<PassengerInput[]>(
    Array.from({ length: passengerCount }, emptyPassenger)
  );

  function updateField(idx: number, field: keyof PassengerInput, value: string) {
    setForms((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = forms.every((p) => p.firstName && p.lastName && p.dateOfBirth && p.nationality);
    if (!valid) return;
    setPassengers(forms);
    router.push("/booking/contact");
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at bottom left, #713f12 0%, #1e1b4b 30%, #0f172a 70%)",
      }}
    >
      <Header variant="transparent" />

      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <div
          className="w-full max-w-2xl rounded-3xl px-8 py-10"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.3)",
          }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Passenger Information</h1>

          <div className="mb-6">
            <BookingStepper currentLabel="Passenger" variant="dark" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {forms.map((passenger, idx) => (
              <div key={idx}>
                <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">
                  Passenger {idx + 1} (Adult)
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={passenger.title}
                      onChange={(e) => updateField(idx, "title", e.target.value)}
                      className={inputCls}
                      aria-label={`Title for passenger ${idx + 1}`}
                    >
                      {TITLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                      ))}
                    </select>
                    <input
                      value={passenger.firstName}
                      onChange={(e) => updateField(idx, "firstName", e.target.value)}
                      placeholder="First Name"
                      required
                      className={inputCls}
                      aria-label={`First name for passenger ${idx + 1}`}
                    />
                    <input
                      value={passenger.lastName}
                      onChange={(e) => updateField(idx, "lastName", e.target.value)}
                      placeholder="Last Name"
                      required
                      className={inputCls}
                      aria-label={`Last name for passenger ${idx + 1}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={passenger.dateOfBirth}
                      onChange={(e) => updateField(idx, "dateOfBirth", e.target.value)}
                      required
                      className={inputCls}
                      max={new Date().toISOString().split("T")[0]}
                      aria-label={`Date of birth for passenger ${idx + 1}`}
                    />
                    <input
                      value={passenger.passportNumber ?? ""}
                      onChange={(e) => updateField(idx, "passportNumber", e.target.value)}
                      placeholder="Passport Number (optional)"
                      className={inputCls}
                      aria-label={`Passport number for passenger ${idx + 1}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={passenger.gender}
                      onChange={(e) => updateField(idx, "gender", e.target.value)}
                      className={inputCls}
                      aria-label={`Gender for passenger ${idx + 1}`}
                    >
                      {GENDER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                      ))}
                    </select>
                    <select
                      value={passenger.nationality}
                      onChange={(e) => updateField(idx, "nationality", e.target.value)}
                      className={inputCls}
                      aria-label={`Nationality for passenger ${idx + 1}`}
                    >
                      {COMMON_NATIONALITIES.map((n) => (
                        <option key={n.value} value={n.value} className="bg-gray-900">{n.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" onClick={() => router.back()} type="button">
                ← Back
              </Button>
              <Button type="submit">
                Continue →
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-6 text-xs text-white/40">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact Us</span>
        </div>
      </footer>
    </div>
  );
}
