import { createClient } from "@/lib/supabase/server";

export default async function AccountProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // In a real app we would fetch from the `customer` table to show updated info, 
  // but for Phase 2 we use the user metadata as a starting point.
  const { data: customer } = await supabase
    .from("customer")
    .select("*")
    .eq("id", user?.id)
    .single();

  const firstName = customer?.first_name || user?.user_metadata?.first_name || "";
  const lastName = customer?.last_name || user?.user_metadata?.last_name || "";
  const phone = customer?.phone || user?.user_metadata?.phone || "";
  const email = user?.email || "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Basic contact details.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{firstName} {lastName}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{email}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{phone || "Not provided"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
