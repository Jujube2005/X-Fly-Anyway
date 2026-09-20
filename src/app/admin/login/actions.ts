"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData?.user) {
    return { error: error?.message || "Login failed" };
  }

  const { data: roleData } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("id", authData.user.id)
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
