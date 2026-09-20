import { User } from "@supabase/supabase-js";

const DEFAULT_COMPANY_EMAILS = [
  "superadmin@xfly.com",
  "flight1@xfly.com",
  "flight2@xfly.com",
  "booking@xfly.com",
];

export function isCompanyDeviceIdentity(user: User | null): boolean {
  if (!user || !user.email) return false;
  
  const companyEmailStr = process.env.COMPANY_DEVICE_IDENTITY_EMAIL;
  const allowedEmails = companyEmailStr
    ? companyEmailStr.split(",").map((e) => e.trim().toLowerCase())
    : DEFAULT_COMPANY_EMAILS;
    
  return allowedEmails.includes(user.email.toLowerCase());
}
