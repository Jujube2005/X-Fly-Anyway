"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const redirectPath = (formData.get("redirect") as string) || "/account";

  if (!email || !password || !firstName || !lastName) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || "",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Next.js server actions can't easily redirect with a success toast without relying on URL params
  redirect(redirectPath);
}
