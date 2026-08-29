/** Admin route group layout — wraps all admin pages (authentication guard added later) */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
