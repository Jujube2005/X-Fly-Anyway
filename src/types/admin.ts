/** Admin domain types */

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "super_admin";
  createdAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalFlights: number;
  bookingsToday: number;
  revenueToday: number;
  occupancyRate: number; // 0–1
}

export interface RevenueByPeriod {
  period: string; // e.g. "2026-08"
  revenue: number;
  currency: string;
  bookingCount: number;
}
