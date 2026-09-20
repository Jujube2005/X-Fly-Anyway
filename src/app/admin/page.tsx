import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data: roleData } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (roleData as any)?.role;
  if (role === "booking_staff") {
    redirect("/admin/bookings");
  } else if (role === "flight_staff") {
    redirect("/admin/flights");
  } else {
    redirect("/admin/dashboard");
  }
}
