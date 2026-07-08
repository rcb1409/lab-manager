import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { QRCard } from "./QRCard";
import { AddEquipmentClient } from "./AddEquipmentClient";
import { AttachCalendarClient } from "./AttachCalendarClient";
import { DetachCalendarClient } from "./DetachCalendarClient";
import { OnboardingEditClient } from "./OnboardingEditClient";
import { EditEquipmentClient } from "./EditEquipmentClient";

const prisma = new PrismaClient();

export default async function AdminEquipmentPage() {
  const equipment = await prisma.equipment.findMany({
    include: { lab: true },
    orderBy: { lab: { name: 'asc' } }
  });

  const labs = await prisma.lab.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-slab font-bold text-gray-900">Equipment & QR Codes</h1>
        <AddEquipmentClient labs={labs} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Equipment Inventory</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lab</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Onboarding</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Calendar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {equipment.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm font-bold text-gray-900">
                  <div className="flex items-center gap-2">
                    {item.name}
                    <EditEquipmentClient
                      equipment={{
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        description: (item as any).description ?? null,
                        imageUrl: (item as any).imageUrl ?? null,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-normal">{item.type}</div>
                </td>
                <td className="px-4 py-4 text-sm text-ncsu-gray font-medium whitespace-nowrap">{item.lab.name}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${
                    item.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                    item.status === 'IN_USE' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    {/* @ts-ignore */}
                    {item.onboardingRequired && (
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded">Required</span>
                    )}
                    {/* @ts-ignore */}
                    <OnboardingEditClient
                      equipmentId={item.id}
                      equipmentName={item.name}
                      onboardingRequired={(item as any).onboardingRequired ?? false}
                      onboardingMaterials={(item as any).onboardingMaterials ?? null}
                    />
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    {/* @ts-ignore */}
                    {!item.googleCalendarId && (
                      <AttachCalendarClient equipmentId={item.id} />
                    )}
                    {/* @ts-ignore */}
                    {item.googleCalendarId && (
                      <DetachCalendarClient equipmentId={item.id} />
                    )}
                    <Link href={`/admin/schedules#${item.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wide whitespace-nowrap">
                      Schedule
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-6 mt-8">
        <h2 className="text-lg font-bold font-slab text-gray-900 mb-6">Printable QR Codes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {equipment.map((item) => (
            <QRCard key={item.id} equipmentId={item.id} name={item.name} />
          ))}
        </div>
      </div>
    </div>
  );
}
