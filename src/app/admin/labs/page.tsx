import { PrismaClient } from "@prisma/client";
import { AddLabClient } from "./AddLabClient";

const prisma = new PrismaClient();

export default async function AdminLabsPage() {
  const labs = await prisma.lab.findMany({
    include: { equipment: true },
    orderBy: { building: 'asc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-slab font-bold text-gray-900">Lab Spaces & Buildings</h1>
        <AddLabClient />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#f2f2f2]">
          <h2 className="text-lg font-bold text-gray-900 font-slab">Facilities Directory</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Building</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Equipment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {labs.map((lab: any) => (
              <tr key={lab.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{lab.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-ncsu-gray font-medium">{lab.building}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.room}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                    {lab.equipment.length} items
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
