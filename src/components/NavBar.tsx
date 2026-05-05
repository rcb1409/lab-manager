"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function NavBar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600 tracking-tight">
                LabManager
              </Link>
            </div>
            {session && (
              <div className="ml-6 flex items-center space-x-4">
                <Link href="/equipment" className="text-gray-700 hover:text-indigo-600 text-sm font-medium">
                  Equipment
                </Link>
                {/* @ts-ignore */}
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="text-gray-700 hover:text-indigo-600 text-sm font-medium">
                    Admin Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm text-gray-500 font-medium">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
