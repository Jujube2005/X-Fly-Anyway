import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AnalyticsResponse } from "@/types/admin";

/**
 * AdminService — admin-specific reporting and statistics operations.
 * All methods require an authenticated admin Supabase client.
 */
export class AdminService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** Get dashboard analytics for a given time period */
  async getAnalytics(period: "daily" | "weekly" | "monthly"): Promise<AnalyticsResponse> {
    const now = new Date();
    const startDate = new Date();
    
    // Define period boundaries
    if (period === "daily") startDate.setDate(now.getDate() - 1);
    else if (period === "weekly") startDate.setDate(now.getDate() - 7);
    else if (period === "monthly") startDate.setMonth(now.getMonth() - 1);
    
    const startDateStr = startDate.toISOString();

    // 1. Fetch Bookings within period
    const { data: bookings, error: bookingsErr } = await this.supabase
      .from("booking")
      .select()
      .gte("created_at", startDateStr);

    if (bookingsErr) throw bookingsErr;
    
    const bookingsData = (bookings || []) as any[];

    // Filter confirmed or completed bookings for Revenue (Ignore cancelled)
    const activeBookings = bookingsData.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    );

    const totalBookings = activeBookings.length;
    const totalRevenue = activeBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);

    // Group booking volume by date
    const bookingVolumeMap: Record<string, number> = {};
    activeBookings.forEach((b) => {
      const date = b.created_at.split("T")[0];
      bookingVolumeMap[date] = (bookingVolumeMap[date] || 0) + 1;
    });
    const bookingVolume = Object.entries(bookingVolumeMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 2. Fetch Passengers for active bookings (Nationality Analytics)
    const activeBookingIds = activeBookings.map(b => b.id);
    let totalPassengers = 0;
    const nationalitiesMap: Record<string, number> = {};
    
    if (activeBookingIds.length > 0) {
      const { data: passengers, error: passErr } = await this.supabase
        .from("passenger")
        .select()
        .in("booking_id", activeBookingIds);
        
      if (passErr) throw passErr;
      
      const passData = (passengers || []) as any[];
      totalPassengers = passData.length;
      passData.forEach(p => {
         const nat = p.nationality || "Unknown";
         nationalitiesMap[nat] = (nationalitiesMap[nat] || 0) + 1;
      });
    }
    
    const nationalities = Object.entries(nationalitiesMap)
      .map(([nationality, count]) => ({ nationality, count }))
      .sort((a, b) => b.count - a.count);

    // 3. Fetch Destinations (Resolving Connecting Flights)
    const destinationsMap: Record<string, number> = {};
    if (activeBookingIds.length > 0) {
       const { data: legs, error: legsErr } = await this.supabase
         .from("booking_leg")
         .select("booking_id, leg_sequence, flight:flight_id(destination_airport_id)")
         .in("booking_id", activeBookingIds);
         
       if (legsErr) throw legsErr;
       
       const legsData = (legs || []) as any[];
       // Group by booking_id to find the final destination (max leg_sequence)
       const bookingLegs: Record<string, { seq: number; dest: string }> = {};
       legsData.forEach(leg => {
         const flightData = leg.flight as any;
         const flightObj = Array.isArray(flightData) ? flightData[0] : flightData;
         const dest = flightObj?.destination_airport_id;
         
         if (!dest) return;
         if (!bookingLegs[leg.booking_id] || leg.leg_sequence > bookingLegs[leg.booking_id].seq) {
           bookingLegs[leg.booking_id] = { seq: leg.leg_sequence, dest };
         }
       });
       
       Object.values(bookingLegs).forEach(({ dest }) => {
         destinationsMap[dest] = (destinationsMap[dest] || 0) + 1;
       });
    }
    
    const destinations = Object.entries(destinationsMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    // 4. Fetch Flight Occupancy (Current snapshot of active flights)
    const { data: classes, error: classesErr } = await this.supabase
      .from("flight_cabin_class")
      .select("flight_id, total_seats, available_seats, flight:flight_id(flight_number)");
      
    if (classesErr) throw classesErr;
    
    const classesData = (classes || []) as any[];
    const flightOccupancyMap: Record<string, { total: number; avail: number }> = {};
    classesData.forEach(c => {
      const flightData = c.flight as any;
      const flightObj = Array.isArray(flightData) ? flightData[0] : flightData;
      const flightNum = flightObj?.flight_number;
      
      if (!flightNum) return;
      if (!flightOccupancyMap[flightNum]) {
        flightOccupancyMap[flightNum] = { total: 0, avail: 0 };
      }
      flightOccupancyMap[flightNum].total += c.total_seats;
      flightOccupancyMap[flightNum].avail += c.available_seats;
    });
    
    let globalTotal = 0;
    let globalAvail = 0;
    
    const occupancyByFlight = Object.entries(flightOccupancyMap).map(([flightNumber, { total, avail }]) => {
      globalTotal += total;
      globalAvail += avail;
      const occupied = total - avail;
      const occupancy = total > 0 ? (occupied / total) * 100 : 0;
      return { flightNumber, occupancy: Math.round(occupancy) };
    }).sort((a, b) => b.occupancy - a.occupancy);
    
    const averageOccupancy = globalTotal > 0 ? ((globalTotal - globalAvail) / globalTotal) * 100 : 0;

    return {
      overview: {
        totalBookings,
        totalPassengers,
        totalRevenue,
        averageOccupancy: Math.round(averageOccupancy)
      },
      bookingVolume,
      occupancyByFlight,
      destinations,
      nationalities
    };
  }
}
