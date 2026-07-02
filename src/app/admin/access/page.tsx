import { PrismaClient } from '@prisma/client';
import { AccessRequestsClient } from './AccessRequestsClient';
import { GrantedLabAccessClient, GrantedEquipmentAccessClient } from './GrantedAccessClient';

const prisma = new PrismaClient();

export default async function AdminAccessPage() {
  const [pendingRequests, labAccesses, equipmentAccesses, recentResolved] = await Promise.all([
    prisma.accessRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { requestedAt: 'asc' },
      include: {
        user: { select: { name: true, email: true } },
        lab: { select: { name: true, building: true, room: true } },
        equipment: { select: { name: true, lab: { select: { name: true } } } },
      },
    }),
    prisma.labAccess.findMany({
      orderBy: { grantedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        lab: { select: { name: true } },
      },
    }),
    prisma.equipmentAccess.findMany({
      orderBy: { grantedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        equipment: { select: { name: true, lab: { select: { name: true } } } },
      },
    }),
    prisma.accessRequest.findMany({
      where: { status: { not: 'PENDING' } },
      orderBy: { resolvedAt: 'desc' },
      take: 15,
      include: {
        user: { select: { name: true, email: true } },
        lab: { select: { name: true } },
        equipment: { select: { name: true } },
        resolvedBy: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-slab font-bold text-gray-900">Access Management</h1>
        {pendingRequests.length > 0 && (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
            {pendingRequests.length} pending
          </span>
        )}
      </div>

      {/* Pending Requests */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          Pending Requests
        </h2>
        {/* @ts-ignore */}
        <AccessRequestsClient requests={pendingRequests} />
      </section>

      {/* Active Lab Grants */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          Lab Access Grants
          <span className="text-sm text-gray-400 font-normal">({labAccesses.length})</span>
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* @ts-ignore */}
          <GrantedLabAccessClient rows={labAccesses} />
        </div>
      </section>

      {/* Active Equipment Grants */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          Equipment Access Grants
          <span className="text-sm text-gray-400 font-normal">({equipmentAccesses.length})</span>
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* @ts-ignore */}
          <GrantedEquipmentAccessClient rows={equipmentAccesses} />
        </div>
      </section>

      {/* Request History */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent History</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Request</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Resolved By</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {recentResolved.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {req.user.name ?? req.user.email}
                    <span className="block text-xs text-gray-400">{req.user.email}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className={`mr-2 px-1.5 py-0.5 text-xs font-bold rounded ${req.type === 'LAB' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {req.type}
                    </span>
                    {req.lab?.name ?? req.equipment?.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      req.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{req.resolvedBy?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {recentResolved.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No history yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
