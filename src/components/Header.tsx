"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, User, Home, Search, SlidersHorizontal, LogIn, Bookmark } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <>
      <header className="sticky top-0 z-50 bg-ncsu-red text-white shadow-lg">
        <div className="max-w-7xl mx-auto h-16 md:h-20 px-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-slab font-bold text-lg md:text-xl uppercase tracking-tight flex items-center gap-2 hover:text-white/80">
              MSE Equipment Manager
            </Link>
            
            {session && (
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/equipment" className="font-bold text-sm uppercase hover:text-white/80 flex items-center gap-1">
                  Directory
                </Link>
                <Link href="/bookings" className="font-bold text-sm uppercase hover:text-white/80 flex items-center gap-1">
                  My Bookings
                </Link>
                {/* @ts-ignore */}
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="font-bold text-sm uppercase hover:text-white/80 flex items-center gap-1">
                    Dashboard
                  </Link>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-6">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="hidden md:flex items-center gap-2 text-sm font-bold uppercase">
                  <User size={16} /> {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="font-bold text-sm uppercase hover:text-white/80 flex items-center gap-1"
                >
                  <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google", { callbackUrl: "/equipment" })}
                className="font-bold text-sm uppercase border border-white/30 px-4 py-1.5 rounded hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <LogIn size={16} /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-ncsu-red">
          <Home size={24} />
          <span className="text-[10px] font-bold uppercase">Home</span>
        </Link>
        <Link href="/equipment" className="flex flex-col items-center gap-1 text-gray-500 hover:text-ncsu-red">
          <Search size={24} />
          <span className="text-[10px] font-bold uppercase">Search</span>
        </Link>
        <Link href="/bookings" className="flex flex-col items-center gap-1 text-gray-500 hover:text-ncsu-red">
          <Bookmark size={24} />
          <span className="text-[10px] font-bold uppercase">Bookings</span>
        </Link>
        {/* @ts-ignore */}
        {session?.user?.role === "ADMIN" && (
          <Link href="/admin" className="flex flex-col items-center gap-1 text-gray-500 hover:text-ncsu-red">
            <SlidersHorizontal size={24} />
            <span className="text-[10px] font-bold uppercase">Admin</span>
          </Link>
        )}
      </div>
    </>
  );
}
