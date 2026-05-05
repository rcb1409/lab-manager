import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminOverviewPage() {
  const [totalEquipment, totalLabs, activeSessions, pendingBookings] = await Promise.all([
    prisma.equipment.count(),
    prisma.lab.count(),
    prisma.usageLog.count({ where: { endTime: null } }),
    prisma.booking.count({ where: { status: 'PENDING' } })
  ]);

  const recentLogs = await prisma.usageLog.findMany({
    take: 5,
    orderBy: { startTime: 'desc' },
    include: { user: { select: { name: true } }, equipment: { select: { name: true, lab: { select: { name: true } } } } }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Equipment</p>
          <p className="text-3xl font-bold text-gray-900">{totalEquipment}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Labs</p>
          <p className="text-3xl font-bold text-gray-900">{totalLabs}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm bg-indigo-50">
          <p className="text-sm font-medium text-indigo-800 mb-1">Active Sessions</p>
          <p className="text-3xl font-bold text-indigo-600">{activeSessions}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm bg-amber-50">
          <p className="text-sm font-medium text-amber-800 mb-1">Pending Bookings</p>
          <p className="text-3xl font-bold text-amber-600">{pendingBookings}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Recent Usage Activity</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentLogs.map((log) => (
            <li key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{log.user.name}</p>
                  <p className="text-sm text-gray-500">
                    Used <span className="font-medium text-gray-700">{log.equipment.name}</span> in {log.equipment.lab.name}
                  </p>
                  {log.notes && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-100 p-2 rounded italic">
                      "{log.notes}"
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{log.startTime.toLocaleDateString()}</p>
                  <p className="text-xs font-bold mt-1">
                    {log.endTime ? (
                      <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded">Completed</span>
                    ) : (
                      <span className="text-green-700 bg-green-100 px-2 py-1 rounded">In Progress</span>
                    )}
                  </p>
                </div>
              </div>
            </li>
          ))}
          {recentLogs.length === 0 && (
            <li className="p-6 text-center text-gray-500">No usage logs found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
