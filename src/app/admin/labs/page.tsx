import { PrismaClient } from "@prisma/client";
import { AddLabClient } from "./AddLabClient";
import { LabsEquipmentClient } from "./LabsEquipmentClient";

const prisma = new PrismaClient();

export default async function AdminLabsPage() {
  const labs = await prisma.lab.findMany({
    include: {
      equipment: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: [{ building: "asc" }, { name: "asc" }],
  });

  const serialized = labs.map((lab) => ({
    id: lab.id,
    name: lab.name,
    building: lab.building,
    room: lab.room,
    description: (lab as any).description ?? null,
    imageUrl: (lab as any).imageUrl ?? null,
    bookingWindowStart: (lab as any).bookingWindowStart ?? null,
    bookingWindowEnd: (lab as any).bookingWindowEnd ?? null,
    bookingDays: (lab as any).bookingDays ?? null,
    equipment: lab.equipment.map((eq) => ({
      id: eq.id,
      name: eq.name,
      type: eq.type,
      description: (eq as any).description ?? null,
      imageUrl: (eq as any).imageUrl ?? null,
      status: eq.status as string,
      googleCalendarId: (eq as any).googleCalendarId ?? null,
      onboardingRequired: (eq as any).onboardingRequired ?? false,
      onboardingMaterials: (eq as any).onboardingMaterials ?? null,
      bookingWindowStart: (eq as any).bookingWindowStart ?? null,
      bookingWindowEnd: (eq as any).bookingWindowEnd ?? null,
      bookingDays: (eq as any).bookingDays ?? null,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-slab font-bold text-gray-900">
            Labs &amp; Equipment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage labs and their instruments in one place. Click a lab to
            expand it, set booking schedules, configure onboarding, and manage
            calendars.
          </p>
        </div>
        <AddLabClient />
      </div>

      <LabsEquipmentClient labs={serialized} />
    </div>
  );
}
