import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { StatusBoardClient } from "./StatusBoardClient";

const prisma = new PrismaClient();

export default async function AdminOverviewPage() {
  const [labs, pendingBookings, pendingAccess] = await Promise.all([
    prisma.lab.findMany({
      include: {
        equipment: {
          include: {
            usageLogs: {
              where: { endTime: null },
              include: { user: { select: { name: true, email: true } } },
              take: 1,
            },
            bookings: {
              where: {
                status: "APPROVED",
                requestedStart: { gte: new Date() },
              },
              orderBy: { requestedStart: "asc" },
              take: 2,
              include: { user: { select: { name: true, email: true } } },
            },
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: [{ building: "asc" }, { name: "asc" }],
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.accessRequest.count({ where: { status: "PENDING" } }),
  ]);

  const activeSessions = labs
    .flatMap((l) => l.equipment)
    .filter((e) => e.usageLogs.length > 0).length;

  const serializedLabs = labs.map((lab) => ({
    id: lab.id,
    name: lab.name,
    building: lab.building,
    room: lab.room,
    bookingWindowStart: (lab as any).bookingWindowStart ?? null,
    bookingWindowEnd: (lab as any).bookingWindowEnd ?? null,
    bookingDays: (lab as any).bookingDays ?? null,
    equipment: lab.equipment.map((eq) => ({
      id: eq.id,
      name: eq.name,
      type: eq.type,
      status: eq.status as string,
      activeLog: eq.usageLogs[0]
        ? {
            id: eq.usageLogs[0].id,
            startTime: eq.usageLogs[0].startTime.toISOString(),
            user: {
              name: eq.usageLogs[0].user.name,
              email: eq.usageLogs[0].user.email,
            },
          }
        : null,
      upcomingBookings: eq.bookings.map((b) => ({
        id: b.id,
        requestedStart: b.requestedStart.toISOString(),
        requestedEnd: b.requestedEnd.toISOString(),
        user: { name: b.user.name, email: b.user.email },
      })),
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-slab font-bold text-gray-900">
            Live Status
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time equipment status across all labs. Click any action to update
            immediately.
          </p>
        </div>
      </div>

      {/* Alert badges for items needing attention */}
      {(pendingBookings > 0 || pendingAccess > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingBookings > 0 && (
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {pendingBookings} booking{pendingBookings !== 1 ? "s" : ""} need
              approval
            </Link>
          )}
          {pendingAccess > 0 && (
            <Link
              href="/admin/access"
              className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold px-4 py-2 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {pendingAccess} access request{pendingAccess !== 1 ? "s" : ""}{" "}
              pending
            </Link>
          )}
        </div>
      )}

      <StatusBoardClient labs={serializedLabs} />
    </div>
  );
}
