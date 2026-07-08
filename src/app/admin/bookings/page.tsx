import { PrismaClient } from "@prisma/client";
import { BookingActionsClient } from "./BookingActionsClient";

const prisma = new PrismaClient();

export default async function AdminBookingsPage() {
  const pendingBookings = await prisma.booking.findMany({
    where: { status: 'PENDING' },
    orderBy: { requestedStart: 'asc' },
    include: {
      equipment: { select: { name: true, lab: { select: { name: true } } } },
      user: { select: { name: true, email: true } }
    }
  });

  const historyBookings = await prisma.booking.findMany({
    where: { status: { not: 'PENDING' } },
    orderBy: { requestedStart: 'desc' },
    take: 10,
    include: {
      equipment: { select: { name: true, lab: { select: { name: true } } } },
      user: { select: { name: true, email: true } }
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
        <a
          href="/api/admin/export/bookings"
          className="text-xs font-bold px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition-colors"
        >
          Export CSV
        </a>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 bg-amber-50 inline-block px-3 py-1 rounded text-amber-800">Pending Approvals</h2>
        
        {pendingBookings.length === 0 ? (
          <div className="bg-white p-8 text-center border border-gray-200 rounded-xl">
            <p className="text-gray-500">No pending booking requests.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{booking.equipment.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{booking.equipment.lab.name}</p>
                  
                  <div className="text-sm bg-gray-50 p-3 rounded border border-gray-100">
                    <p><span className="font-semibold">Requested By:</span> {booking.user.name} ({booking.user.email})</p>
                    <p><span className="font-semibold">Time:</span> {booking.requestedStart.toLocaleString()} - {booking.requestedEnd.toLocaleString()}</p>
                    <p><span className="font-semibold">Reason:</span> {booking.reason}</p>
                  </div>
                </div>
                
                <div className="shrink-0">
                  <BookingActionsClient bookingId={booking.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent History</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.equipment.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.requestedStart.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
