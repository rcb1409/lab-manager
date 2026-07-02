'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { grantAccess, denyAccess } from './actions';

interface AccessRequest {
  id: string;
  type: 'LAB' | 'EQUIPMENT';
  status: string;
  message: string | null;
  requestedAt: Date;
  user: { name: string | null; email: string };
  lab: { name: string; building: string; room: string } | null;
  equipment: { name: string; lab: { name: string } } | null;
}

export function AccessRequestsClient({ requests }: { requests: AccessRequest[] }) {
  const router = useRouter();
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function handle(requestId: string, action: 'grant' | 'deny') {
    startTransition(async () => {
      if (action === 'grant') {
        await grantAccess(requestId);
      } else {
        await denyAccess(requestId);
      }
      setResolved((prev) => new Set([...prev, requestId]));
      router.refresh();
    });
  }

  const visible = requests.filter((r) => !resolved.has(r.id));

  if (visible.length === 0) {
    return (
      <div className="bg-white p-8 text-center border border-gray-200 rounded-xl">
        <p className="text-gray-500">No pending access requests.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {visible.map((req) => (
        <div
          key={req.id}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  req.type === 'LAB'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {req.type === 'LAB' ? 'Lab Access' : 'Equipment Access'}
              </span>
              {req.type === 'LAB' && req.lab && (
                <span className="font-bold text-gray-900 text-sm">{req.lab.name}</span>
              )}
              {req.type === 'EQUIPMENT' && req.equipment && (
                <span className="font-bold text-gray-900 text-sm">
                  {req.equipment.name}
                  <span className="text-gray-500 font-normal"> — {req.equipment.lab.name}</span>
                </span>
              )}
            </div>

            <div className="text-sm bg-gray-50 p-3 rounded border border-gray-100 space-y-0.5">
              <p>
                <span className="font-semibold">Requester:</span>{' '}
                {req.user.name ?? req.user.email} ({req.user.email})
              </p>
              {req.message && (
                <p>
                  <span className="font-semibold">Message:</span> {req.message}
                </p>
              )}
              <p className="text-gray-400 text-xs">
                Requested {new Date(req.requestedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handle(req.id, 'grant')}
              disabled={isPending}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
            >
              Approve
            </button>
            <button
              onClick={() => handle(req.id, 'deny')}
              disabled={isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
            >
              Deny
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
