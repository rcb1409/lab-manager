'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { revokeLabAccess, revokeEquipmentAccess } from './actions';

interface LabAccessRow {
  id: string;
  userId: string;
  labId: string;
  grantedAt: Date;
  user: { name: string | null; email: string };
  lab: { name: string };
}

interface EquipmentAccessRow {
  id: string;
  userId: string;
  equipmentId: string;
  grantedAt: Date;
  user: { name: string | null; email: string };
  equipment: { name: string; lab: { name: string } };
}

export function GrantedLabAccessClient({ rows }: { rows: LabAccessRow[] }) {
  const router = useRouter();
  const [revoked, setRevoked] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function revoke(userId: string, labId: string, rowId: string) {
    startTransition(async () => {
      await revokeLabAccess(userId, labId);
      setRevoked((prev) => new Set([...prev, rowId]));
      router.refresh();
    });
  }

  const visible = rows.filter((r) => !revoked.has(r.id));

  if (visible.length === 0) {
    return <p className="text-gray-400 text-sm px-2">No lab access grants yet.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lab</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Granted</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {visible.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">
              {row.user.name ?? row.user.email}
              <span className="block text-xs text-gray-400">{row.user.email}</span>
            </td>
            <td className="px-4 py-3 text-gray-600">{row.lab.name}</td>
            <td className="px-4 py-3 text-gray-400">{new Date(row.grantedAt).toLocaleDateString()}</td>
            <td className="px-4 py-3 text-right">
              <button
                onClick={() => revoke(row.userId, row.labId, row.id)}
                disabled={isPending}
                className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
              >
                Revoke
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function GrantedEquipmentAccessClient({ rows }: { rows: EquipmentAccessRow[] }) {
  const router = useRouter();
  const [revoked, setRevoked] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function revoke(userId: string, equipmentId: string, rowId: string) {
    startTransition(async () => {
      await revokeEquipmentAccess(userId, equipmentId);
      setRevoked((prev) => new Set([...prev, rowId]));
      router.refresh();
    });
  }

  const visible = rows.filter((r) => !revoked.has(r.id));

  if (visible.length === 0) {
    return <p className="text-gray-400 text-sm px-2">No equipment access grants yet.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Equipment</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lab</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Granted</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {visible.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">
              {row.user.name ?? row.user.email}
              <span className="block text-xs text-gray-400">{row.user.email}</span>
            </td>
            <td className="px-4 py-3 text-gray-700 font-medium">{row.equipment.name}</td>
            <td className="px-4 py-3 text-gray-500">{row.equipment.lab.name}</td>
            <td className="px-4 py-3 text-gray-400">{new Date(row.grantedAt).toLocaleDateString()}</td>
            <td className="px-4 py-3 text-right">
              <button
                onClick={() => revoke(row.userId, row.equipmentId, row.id)}
                disabled={isPending}
                className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
              >
                Revoke
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
