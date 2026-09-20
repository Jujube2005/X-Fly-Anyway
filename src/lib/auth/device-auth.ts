import { User } from "@supabase/supabase-js";

export function isCompanyDeviceIdentity(user: User | null): boolean {
  if (!user || !user.email) return false;
  
  const companyEmailStr = process.env.COMPANY_DEVICE_IDENTITY_EMAIL;
  if (!companyEmailStr) return false;
  
  const allowedEmails = companyEmailStr.split(',').map(e => e.trim().toLowerCase());
  return allowedEmails.includes(user.email.toLowerCase());
}
