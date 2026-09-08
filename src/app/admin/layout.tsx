import { AdminSidebar } from "@/components/admin/AdminSidebar";

/** Admin layout — light #e8eef5 background with white sidebar */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#e8eef5] flex gap-5 p-5">
      <AdminSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
