import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AnalyticsResponse } from "@/types/admin";

/**
 * AdminService — admin-specific reporting and statistics operations.
 * All methods require an authenticated admin Supabase client.
 */
export class AdminService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** Get dashboard analytics for a given time period and optional destination */
  async getAnalytics(period: "daily" | "weekly" | "monthly", role: string = "super_admin", userId?: string, destination?: string): Promise<AnalyticsResponse> {
    const now = new Date();
    const startDate = new Date();
    
    // Define period boundaries
    if (period === "daily") startDate.setDate(now.getDate() - 1);
    else if (period === "weekly") startDate.setDate(now.getDate() - 7);
    else if (period === "monthly") startDate.setMonth(now.getMonth() - 1);
    
    const startDateStr = startDate.toISOString();

    let assignedFlightIds: string[] | null = null; // null means all flights (super_admin)

    // Filter assigned flights for flight_staff
    if (role === "flight_staff" && userId) {
      const { data: assignments } = await this.supabase
        .from("flight_staff_assignment")
        .select("flight_id")
        .eq("staff_id", userId);
      
      assignedFlightIds = ((assignments as any[]) || []).map(a => a.flight_id);
    }

    // Filter by destination if provided
    let destFlightIds: string[] | null = null;
    if (destination) {
      const { data: destFlights } = await this.supabase
        .from("flight")
        .select("id")
        .eq("destination_airport_id", destination);
        
      destFlightIds = ((destFlights as any[]) || []).map(f => f.id);
    }

    // Intersect RBAC and Destination filters
    let effectiveFlightIds: string[] | null = null;
    
    if (assignedFlightIds !== null && destFlightIds !== null) {
      effectiveFlightIds = assignedFlightIds.filter(id => destFlightIds!.includes(id));
    } else if (assignedFlightIds !== null) {
      effectiveFlightIds = assignedFlightIds;
    } else if (destFlightIds !== null) {
      effectiveFlightIds = destFlightIds;
    }

    // If staff has no assignments OR destination filter yields zero flights, return empty analytics immediately
    if (effectiveFlightIds !== null && effectiveFlightIds.length === 0) {
      return {
        overview: { totalBookings: 0, totalPassengers: 0, totalRevenue: 0, averageOccupancy: 0 },
        bookingVolume: [],
        occupancyByFlight: [],
        destinations: [],
        nationalities: []
      };
    }

    // 1. Fetch Bookings within period
    let bookingsQuery = this.supabase
      .from("booking")
      .select()
      .gte("created_at", startDateStr);

    // Filter bookings by effectiveFlightIds (either directly or via legs)
    if (effectiveFlightIds !== null && effectiveFlightIds.length > 0) {
      const { data: legs } = await this.supabase
        .from("booking_leg")
        .select("booking_id")
        .in("flight_id", effectiveFlightIds);
        
      const legBookingIds = ((legs as any[]) || []).map(l => l.booking_id);
      
      const flightIdFilter = `flight_id.in.(${effectiveFlightIds.join(',')})`;
      const idFilter = legBookingIds.length > 0 ? `id.in.(${legBookingIds.join(',')})` : ``;
      
      if (idFilter) {
        bookingsQuery = bookingsQuery.or(`${flightIdFilter},${idFilter}`);
      } else {
        bookingsQuery = bookingsQuery.in("flight_id", effectiveFlightIds);
      }
    }

    const { data: bookings, error: bookingsErr } = await bookingsQuery;

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
       let legsQuery = this.supabase
         .from("booking_leg")
         .select("booking_id, leg_sequence, flight:flight_id(destination_airport_id, id)")
         .in("booking_id", activeBookingIds);
         
       const { data: legs, error: legsErr } = await legsQuery;
         
       if (legsErr) throw legsErr;
       
       const legsData = (legs || []) as any[];
       // Group by booking_id to find the final destination (max leg_sequence)
       // If flight_staff, we only count destinations for flights they are assigned to
       const bookingLegs: Record<string, { seq: number; dest: string }> = {};
       legsData.forEach(leg => {
         const flightData = leg.flight as any;
         const flightObj = Array.isArray(flightData) ? flightData[0] : flightData;
         const dest = flightObj?.destination_airport_id;
         const flightId = flightObj?.id;
         
         if (!dest) return;
         if (effectiveFlightIds !== null && !effectiveFlightIds.includes(flightId)) return; // Exclude filtered flight segments from destination analysis

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
    let occupancyQuery = this.supabase
      .from("flight_cabin_class")
      .select("flight_id, total_seats, available_seats, flight:flight_id(flight_number)");
      
    if (effectiveFlightIds !== null && effectiveFlightIds.length > 0) {
      occupancyQuery = occupancyQuery.in("flight_id", effectiveFlightIds);
    }
      
    const { data: classes, error: classesErr } = await occupancyQuery;
      
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
