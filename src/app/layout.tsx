import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { BookingProvider } from "@/components/booking/BookingProvider";

const notoSansThai = Noto_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "X-Fly Anyway — Book Flights, Fly Anywhere",
    template: "%s | X-Fly Anyway",
  },
  description:
    "Book affordable flights with X-Fly Anyway. Search, compare, and reserve seats in seconds — no account required.",
  keywords: ["flight booking", "cheap flights", "airline tickets", "X-Fly"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    siteName: "X-Fly Anyway",
    title: "X-Fly Anyway — Book Flights, Fly Anywhere",
    description:
      "Search and book flights instantly — no login needed. Just pick your route and go.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body className="min-h-dvh flex flex-col antialiased">
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  );
}

