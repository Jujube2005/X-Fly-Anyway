/** Admin domain types */

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "super_admin";
  createdAt: string;
}

export interface AnalyticsResponse {
  overview: {
    totalBookings: number;
    totalPassengers: number;
    totalRevenue: number;
    averageOccupancy: number; // 0-100
  };
  bookingVolume: {
    date: string; // YYYY-MM-DD
    count: number;
  }[];
  occupancyByFlight: {
    flightNumber: string;
    occupancy: number; // 0-100
  }[];
  destinations: {
    city: string;
    count: number;
  }[];
  nationalities: {
    nationality: string;
    count: number;
  }[];
}
