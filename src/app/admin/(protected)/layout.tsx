import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isCompanyDeviceIdentity } from "@/lib/auth/device-auth";

/** Admin layout — light #e8eef5 background with white sidebar */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Enforce company device restriction
  if (!isCompanyDeviceIdentity(user)) {
    redirect("/"); // Redirect non-company identities to customer experience
  }

  // Check RBAC for admin_roles
  const { data: roleData, error } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !roleData) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-[#e8eef5] flex gap-5 p-5">
      <AdminSidebar role={(roleData as any).role} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
