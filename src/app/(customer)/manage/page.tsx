"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/Button";

export default function ManageBookingPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [reference, setReference] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic client validation
    const trimmedRef = reference.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedRef || !trimmedLast) {
      setErrorMsg(t.manage?.fieldsRequired ?? "Both fields are required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/bookings/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: trimmedRef,
          lastName: trimmedLast,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(t.manage?.invalidCredentials || "Booking Reference or Last Name is incorrect.");
      }

      // Success, redirect to the ticket page
      if (data.success && data.reference) {
        router.push(`/ticket/${encodeURIComponent(data.reference)}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-24 relative overflow-hidden bg-[#0b192c]">
      {/* Background aesthetics matching X-Fly design */}
      <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-[#f5c800]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 -left-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            {t.nav.manage || "Manage Booking"}
          </h1>
          <p className="text-white/60 text-sm">
            {t.manage?.subtitle ?? "View your e-ticket or cancel your booking."}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm text-center animate-in fade-in zoom-in-95">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reference" className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {t.manage?.reference ?? "Booking Reference (PNR)"}
              </label>
              <input
                id="reference"
                type="text"
                placeholder="e.g., XFA-20260918-A1B2"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                className="bg-black/20 border border-white/10 text-white placeholder:text-white/20 rounded-xl px-4 py-3.5 outline-none focus:border-[#f5c800]/50 focus:ring-1 focus:ring-[#f5c800]/50 transition-all font-mono"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {t.manage?.lastName ?? "Contact or Passenger Last Name"}
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="e.g., Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-black/20 border border-white/10 text-white placeholder:text-white/20 rounded-xl px-4 py-3.5 outline-none focus:border-[#f5c800]/50 focus:ring-1 focus:ring-[#f5c800]/50 transition-all"
                required
              />
            </div>

            <div className="mt-2">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
                className="py-4 font-bold text-base shadow-lg shadow-[#f5c800]/20"
              >
                {t.manage?.search ?? "Find My Booking"}
              </Button>
            </div>
            
            <p className="text-[11px] text-white/40 text-center mt-2 leading-relaxed">
              {t.manage?.securityNote ?? "For your security, we require both the Booking Reference and the Last Name to retrieve your e-ticket."}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
