import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">You do not have administrative privileges to view this area.</p>
          <Link href="/" className="text-red-700 font-semibold underline hover:text-red-900">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 shrink-0 bg-white border border-gray-200 rounded-xl p-5 shadow-sm self-start">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Admin Menu</h2>
        <nav className="space-y-2">
          <Link href="/admin" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-700 hover:bg-indigo-50">
            Overview / Analytics
          </Link>
          <Link href="/admin/bookings" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 flex justify-between items-center">
            Booking Requests
          </Link>
          <Link href="/admin/schedules" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-700 hover:bg-indigo-50">
            Global Schedules
          </Link>
          <Link href="/admin/equipment" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-700 hover:bg-indigo-50">
            Equipment & QR Codes
          </Link>
          <Link href="/admin/labs" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-indigo-700 hover:bg-indigo-50">
            Labs Management
          </Link>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
