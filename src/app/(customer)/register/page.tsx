"use client";

import { useState } from "react";
import { register } from "./actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
        
        <form action={handleSubmit} className="mt-8 space-y-6">
          <input type="hidden" name="redirect" value={redirectPath} />
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="flex -space-x-px">
              <div className="w-1/2">
                <label htmlFor="firstName" className="sr-only">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-tl-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="First Name"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="lastName" className="sr-only">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-tr-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="Phone Number (Optional)"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm transition-colors"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors disabled:opacity-50"
            >
              {isPending ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
