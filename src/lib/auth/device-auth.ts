import { User } from "@supabase/supabase-js";

export function isCompanyDeviceIdentity(user: User | null): boolean {
  if (!user || !user.email) return false;
  
  const companyEmail = process.env.COMPANY_DEVICE_IDENTITY_EMAIL;
  if (!companyEmail) return false;
  
  return user.email.toLowerCase() === companyEmail.toLowerCase();
}
