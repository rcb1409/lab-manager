import { PrismaClient } from "@prisma/client";
import { ScheduleMonitorClient } from "./ScheduleMonitorClient";

const prisma = new PrismaClient();

export default async function AdminSchedulesPage() {
  // Fetch labs and equipment with calendar attachments
  const equipments = await prisma.equipment.findMany({
    include: { lab: true },
    orderBy: [{ lab: { name: 'asc' } }, { name: 'asc' }]
  });

  // Fetch all active usage logs
  const activeUsageLogs = await prisma.usageLog.findMany({
    where: { endTime: null },
    include: { user: { select: { name: true, email: true } }, equipment: true }
  });

  // Fetch all upcoming bookings
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      status: 'APPROVED',
      requestedStart: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    },
    orderBy: { requestedStart: 'asc' },
    include: { user: { select: { name: true, email: true } }, equipment: true }
  });

  // Extract all calendar IDs for the unified iframe
  const calendarIds = equipments
    // @ts-ignore
    .map(eq => eq.googleCalendarId)
    .filter(Boolean) as string[];

  const multiCalendarUrl = calendarIds.length > 0
    ? `https://calendar.google.com/calendar/embed?mode=WEEK&showNav=1&showPrint=0&showTabs=1&showCalendars=1&showTz=1&${calendarIds.map(id => `src=${encodeURIComponent(id)}`).join('&')}`
    : '';

  // Serialize data for client component (dates → ISO strings)
  const serializedEquipments = equipments.map(eq => ({
    id: eq.id,
    name: eq.name,
    type: eq.type,
    status: eq.status as string,
    // @ts-ignore
    googleCalendarId: eq.googleCalendarId as string | null,
    lab: { id: eq.lab.id, name: eq.lab.name },
  }));

  const serializedLogs = activeUsageLogs.map(log => ({
    id: log.id,
    equipmentId: log.equipmentId,
    startTime: log.startTime.toISOString(),
    user: { name: log.user.name, email: log.user.email },
  }));

  const serializedBookings = upcomingBookings.map(booking => ({
    id: booking.id,
    equipmentId: booking.equipmentId,
    requestedStart: booking.requestedStart.toISOString(),
    requestedEnd: booking.requestedEnd.toISOString(),
    reason: booking.reason,
    user: { name: booking.user.name, email: booking.user.email },
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-slab font-bold text-gray-900">Schedule Monitor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor all equipment calendars and schedules from a single view.
          </p>
        </div>
        <a
          href="/api/admin/export/usage-logs"
          className="text-xs font-bold px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Export Usage Logs CSV
        </a>
      </div>

      <ScheduleMonitorClient
        equipments={serializedEquipments}
        activeLogs={serializedLogs}
        upcomingBookings={serializedBookings}
        multiCalendarUrl={multiCalendarUrl}
      />
    </div>
  );
}
