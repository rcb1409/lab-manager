import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { CancelBookingClient } from "./CancelBookingClient";
import { RescheduleBookingClient } from "./RescheduleBookingClient";

const prisma = new PrismaClient();

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-sm text-center">
        <h2 className="text-lg font-bold text-yellow-900 mb-2">Authentication Required</h2>
        <p className="text-yellow-800 text-sm">Please sign in to view your reservations.</p>
      </div>
    );
  }

  const bookings = await prisma.booking.findMany({
    // @ts-ignore
    where: { userId: session.user.id },
    include: {
      equipment: { include: { lab: true } }
    },
    orderBy: { requestedStart: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-slab font-bold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-2">Manage your equipment reservation requests and view their status.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-6 font-medium">You have not requested any equipment bookings yet.</p>
          <Link href="/equipment" className="text-sm bg-ncsu-red text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity shadow-sm">
            Browse Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-ncsu-red/30 transition-colors">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  <Link href={`/equipment/${booking.equipmentId}`} className="hover:text-ncsu-red">
                    {booking.equipment.name}
                  </Link>
                </h3>
                <p className="text-sm text-ncsu-gray mb-3 font-medium">
                  📍 {booking.equipment.lab.name}
                </p>
                
                <div className="text-sm bg-[#f2f2f2] p-3 rounded border border-gray-100 flex flex-col sm:flex-row gap-6">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Scheduled Time</span>
                    <span className="font-medium text-gray-800">
                      {booking.requestedStart.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} - {booking.requestedEnd.toLocaleTimeString([], { timeStyle: 'short' })}
                    </span>
                  </div>
                  {booking.reason && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Reason</span>
                      <span className="text-gray-700">{booking.reason}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0 justify-between h-full min-h-[5rem]">
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border shadow-sm ${
                  booking.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 
                  booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {booking.status}
                </span>

                {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                  <div className="flex items-center gap-3">
                    <RescheduleBookingClient bookingId={booking.id} />
                    <CancelBookingClient bookingId={booking.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
