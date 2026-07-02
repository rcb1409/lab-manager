import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionForm } from "./SessionForm";
import { BookingForm } from "./BookingForm";
import { LabAccessGate } from "./LabAccessGate";
import { EquipmentAccessGate } from "./EquipmentAccessGate";
import Link from "next/link";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function EquipmentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  const equipment = await prisma.equipment.findUnique({
    where: { id: params.id },
    include: {
      lab: true,
      usageLogs: {
        where: { endTime: null },
        include: { user: true },
      },
      bookings: {
        where: {
          status: 'APPROVED',
          requestedEnd: { gt: new Date() }
        },
        orderBy: { requestedStart: 'asc' },
        include: { user: { select: { name: true } } }
      }
    }
  });

  if (!equipment) return notFound();

  const activeLog = equipment.usageLogs[0] || null;
  // @ts-ignore
  const isCurrentUserUsing = !!(activeLog && session?.user && activeLog.userId === session.user.id);

  // @ts-ignore
  const userId = session?.user?.id as string | undefined;
  // @ts-ignore
  const isAdmin = session?.user?.role === 'ADMIN';

  let labAccess = null;
  let equipmentAccess = null;
  let pendingLabRequest = null;
  let pendingEquipmentRequest = null;

  if (userId && !isAdmin) {
    [labAccess, equipmentAccess, pendingLabRequest, pendingEquipmentRequest] = await Promise.all([
      prisma.labAccess.findUnique({
        where: { userId_labId: { userId, labId: equipment.labId } },
      }),
      prisma.equipmentAccess.findUnique({
        where: { userId_equipmentId: { userId, equipmentId: equipment.id } },
      }),
      prisma.accessRequest.findFirst({
        where: { userId, labId: equipment.labId, type: 'LAB', status: 'PENDING' },
      }),
      prisma.accessRequest.findFirst({
        where: { userId, equipmentId: equipment.id, type: 'EQUIPMENT', status: 'PENDING' },
      }),
    ]);
  }

  const hasLabAccess = isAdmin || !!labAccess;
  // Equipment-level access gate only applies when the admin has turned on onboardingRequired
  const needsEquipAccess = !!(equipment as any).onboardingRequired;
  const hasEquipAccess = isAdmin || !needsEquipAccess || !!equipmentAccess;
  const hasFullAccess = hasLabAccess && hasEquipAccess;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/equipment" className="text-sm font-bold text-gray-500 hover:text-ncsu-red mb-6 inline-flex items-center gap-1 uppercase tracking-wide">
        &larr; Directory
      </Link>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-ncsu-red px-6 py-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-slab font-bold tracking-tight">{equipment.name}</h1>
              <p className="mt-1 text-white/80 text-sm font-medium">{equipment.type} in {equipment.lab.name}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm border ${equipment.status === 'AVAILABLE' ? 'bg-white text-green-700 border-white' :
                equipment.status === 'IN_USE' ? 'bg-amber-400 text-amber-900 border-amber-400' :
                  'bg-ncsu-gray text-white border-ncu-gray'
              }`}>
              {equipment.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {!session ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <p className="text-sm text-yellow-700">
                You must sign in with your university account to log usage for this equipment.
              </p>
            </div>
          ) : !hasLabAccess ? (
            <LabAccessGate
              labId={equipment.labId}
              labName={equipment.lab.name}
              hasPendingRequest={!!pendingLabRequest}
            />
          ) : !hasEquipAccess ? (
            <EquipmentAccessGate
              equipmentId={equipment.id}
              equipmentName={equipment.name}
              // @ts-ignore
              onboardingMaterials={equipment.onboardingMaterials ?? null}
              hasPendingRequest={!!pendingEquipmentRequest}
            />
          ) : (
            <div className="mt-4">
              <SessionForm
                equipmentId={equipment.id}
                status={equipment.status as string}
                activeLog={activeLog ? {
                  id: activeLog.id,
                  userName: activeLog.user.name ? `${activeLog.user.name} (${activeLog.user.email})` : activeLog.user.email,
                  isCurrentUser: isCurrentUserUsing
                } : null}
              />
            </div>
          )}
        </div>

        <div className="bg-[#f2f2f2] px-6 py-6 border-t border-gray-200">
          {/* @ts-ignore */}
          {equipment.googleCalendarId && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
              {/* @ts-ignore */}
              <div className="gcal-wrapper">
                <iframe key={Date.now()} src={`https://calendar.google.com/calendar/embed?src=${equipment.googleCalendarId}&mode=WEEK`} className="gcal-iframe" frameBorder="0" scrolling="no"></iframe>
              </div>
            </div>
          )}

          {session && hasFullAccess && <BookingForm equipmentId={equipment.id} />}
        </div>
      </div>
    </div>
  );
}
