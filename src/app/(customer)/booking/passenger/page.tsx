"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Button } from "@/components/ui/Button";
import { useBookingContext, type PassengerInput } from "@/components/booking/BookingProvider";
import { useTranslation } from "@/hooks/useTranslation";
import "./page.css";

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
  { value: "Master", label: "Master" },
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
  const { t } = useTranslation();
  const { passengerCount, passengers, setPassengers } = useBookingContext();

  const [forms, setForms] = useState<PassengerInput[]>(
    passengers?.length > 0 ? passengers : Array(passengerCount).fill(null).map(() => ({
      title: "Mr",
      firstName: "",
      lastName: "",
      gender: "M",
      dateOfBirth: "",
    }))
  );

  // Maximum allowed Date of Birth (must be at least 14 days old to fly)
  const maxDobDate = new Date();
  maxDobDate.setDate(maxDobDate.getDate() - 14);
  const maxDobString = maxDobDate.toISOString().split("T")[0];

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

  const genderOptions = [
    { value: "male", label: t.booking?.passenger?.male ?? "Male" },
    { value: "female", label: t.booking?.passenger?.female ?? "Female" },
    { value: "unspecified", label: t.booking?.passenger?.unspecified ?? "Prefer not to say" },
  ];

  return (
    <div className="min-h-dvh flex flex-col passenger-page-container">
      <Header variant="transparent" />

      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-2xl rounded-3xl px-8 py-10 passenger-card-glass">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t.booking?.passenger?.title ?? "Passenger Information"}
          </h1>

          <div className="mb-6">
            <BookingStepper currentLabel="Passenger" variant="dark" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {forms.map((passenger, idx) => (
              <div key={idx}>
                <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wide">
                  {t.booking?.passenger?.passengerN ?? "Passenger"} {idx + 1} ({t.booking?.passenger?.adult ?? "Adult"})
                </h2>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={passenger.title}
                      onChange={(e) => updateField(idx, "title", e.target.value)}
                      className={inputCls}
                      aria-label={`${t.booking?.passenger?.title_field ?? "Title"} for passenger ${idx + 1}`}
                    >
                      {TITLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                      ))}
                    </select>
                    <input
                      value={passenger.firstName}
                      onChange={(e) => updateField(idx, "firstName", e.target.value)}
                      placeholder={t.booking?.passenger?.firstName ?? "First Name"}
                      required
                      className={inputCls}
                      aria-label={`${t.booking?.passenger?.firstName ?? "First name"} for passenger ${idx + 1}`}
                    />
                    <input
                      value={passenger.lastName}
                      onChange={(e) => updateField(idx, "lastName", e.target.value)}
                      placeholder={t.booking?.passenger?.lastName ?? "Last Name"}
                      required
                      className={inputCls}
                      aria-label={`${t.booking?.passenger?.lastName ?? "Last name"} for passenger ${idx + 1}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 relative">
                      <label className="text-[10px] font-medium text-white/60 ml-2 absolute -top-2 left-2 bg-[#1a1b26] px-1 z-10">
                        {t.booking?.passenger?.dateOfBirth ?? "Date of birth"}
                      </label>
                      <input
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) => updateField(idx, "dateOfBirth", e.target.value)}
                        required
                        className={`${inputCls} relative pt-2`}
                        max={maxDobString}
                        aria-label={`${t.booking?.passenger?.dateOfBirth ?? "Date of birth"} for passenger ${idx + 1}`}
                      />
                    </div>
                    <input
                      value={passenger.passportNumber ?? ""}
                      onChange={(e) => updateField(idx, "passportNumber", e.target.value)}
                      placeholder={t.booking?.passenger?.passportOptional ?? "Passport Number (optional)"}
                      className={inputCls}
                      aria-label={`${t.booking?.passenger?.passportNumber ?? "Passport number"} for passenger ${idx + 1}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={passenger.gender}
                      onChange={(e) => updateField(idx, "gender", e.target.value)}
                      className={inputCls}
                      aria-label={`${t.booking?.passenger?.gender ?? "Gender"} for passenger ${idx + 1}`}
                    >
                      {genderOptions.map((o) => (
                        <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                      ))}
                    </select>
                    <select
                      value={passenger.nationality}
                      onChange={(e) => updateField(idx, "nationality", e.target.value)}
                      className={inputCls}
                      aria-label={`${t.booking?.passenger?.nationality ?? "Nationality"} for passenger ${idx + 1}`}
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
                {t.booking?.passenger?.back ?? "← Back"}
              </Button>
              <Button type="submit">
                {t.booking?.passenger?.continueToContact ?? "Continue →"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-6 text-xs text-white/40">
          <span>{t.home?.footer?.privacy ?? "Privacy Policy"}</span>
          <span>{t.home?.footer?.terms ?? "Terms of Service"}</span>
          <span>{t.home?.footer?.support ?? "Support"}</span>
        </div>
      </footer>
    </div>
  );
}
