"use server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { adminAction } from "@/lib/action-utils";

const prisma = new PrismaClient();

export const addEquipment = adminAction(async (session, data: { name: string; type: string; labId: string; description?: string; imageUrl?: string }) => {
  await prisma.equipment.create({
    data: {
      name: data.name,
      type: data.type,
      labId: data.labId,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      status: 'AVAILABLE' // New equipment always starts as available
    }
  });

  revalidatePath('/admin/equipment');
  revalidatePath('/equipment');
});

export const updateEquipment = adminAction(
  async (
    _session,
    equipmentId: string,
    data: { name: string; type: string; description?: string; imageUrl?: string }
  ) => {
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        name: data.name,
        type: data.type,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
      },
    });

    revalidatePath('/admin/equipment');
    revalidatePath('/admin/labs');
    revalidatePath('/equipment');
    revalidatePath(`/equipment/${equipmentId}`);
  }
);

export const deleteEquipment = adminAction(async (_session, equipmentId: string) => {
  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!equipment) throw new Error("Equipment not found");

  if (equipment.googleCalendarId) {
    try {
      const { deleteEquipmentCalendar } = await import('@/lib/calendar-service');
      await deleteEquipmentCalendar(equipment.googleCalendarId);
    } catch (e) {
      console.error("Failed to delete Google Calendar while deleting equipment", e);
    }
  }

  await prisma.equipment.delete({ where: { id: equipmentId } });

  revalidatePath('/admin/equipment');
  revalidatePath('/admin/labs');
  revalidatePath('/equipment');
});

export const attachCalendarToEquipment = adminAction(async (session, equipmentId: string) => {
  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId }
  });

  if (!equipment) throw new Error("Equipment not found");
  // @ts-ignore
  if (equipment.googleCalendarId) throw new Error("Already has calendar");

  const { createEquipmentCalender } = await import('@/lib/calendar-service');
  const newCalendarId = await createEquipmentCalender(equipment.name);

  if (!newCalendarId) throw new Error("Failed to create Google Calendar");

  await prisma.equipment.update({
    where: { id: equipmentId },
    data: {
      // @ts-ignore
      googleCalendarId: newCalendarId
    }
  });

  revalidatePath('/admin/equipment');
});

export const detachCalendarFromEquipment = adminAction(async (session, equipmentId: string) => {
  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId }
  });

  if (!equipment) throw new Error("Equipment not found");
  // @ts-ignore
  if (!equipment.googleCalendarId) throw new Error("Equipment has no calendar attached");

  const { deleteEquipmentCalendar } = await import('@/lib/calendar-service');
  // @ts-ignore
  await deleteEquipmentCalendar(equipment.googleCalendarId);

  await prisma.equipment.update({
    where: { id: equipmentId },
    data: {
      // @ts-ignore
      googleCalendarId: null
    }
  });

  revalidatePath('/admin/equipment');
  revalidatePath('/equipment');
});

export const adminRescheduleBooking = adminAction(async (session, bookingId: string, startIso: string, endIso: string) => {
  const booking = await prisma.booking.findUnique({ 
    where: { id: bookingId },
    include: { equipment: true }
  });
  
  if (!booking) throw new Error("Booking not found");

  const requestedStart = new Date(startIso);
  const requestedEnd = new Date(endIso);

  const overlappingBookings = await prisma.booking.findMany({
    where: {
      equipmentId: booking.equipmentId,
      status: 'APPROVED',
      id: { not: bookingId }, 
      requestedStart: { lt: requestedEnd },
      requestedEnd: { gt: requestedStart },
    }
  });

  if (overlappingBookings.length > 0) {
    throw new Error("This timeslot clashes with another confirmed block. Force overwrite is not currently supported.");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      requestedStart,
      requestedEnd
    }
  });

  if (booking.googleEventId && booking.equipment.googleCalendarId) {
    try {
      const { updateCalendarEvent } = await import('@/lib/calendar-service');
      await updateCalendarEvent({
        googleCalendarId: booking.equipment.googleCalendarId,
        eventId: booking.googleEventId,
        startTime: requestedStart,
        endTime: requestedEnd
      });
    } catch (e) {
      console.error("Failed to re-sync with Google calendar", e);
    }
  }

  revalidatePath(`/admin/equipment/${booking.equipmentId}/schedule`);
  revalidatePath('/bookings');
});

export const updateEquipmentAvailability = adminAction(
  async (
    _session,
    equipmentId: string,
    data: { bookingWindowStart: string | null; bookingWindowEnd: string | null; bookingDays: string | null }
  ) => {
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        bookingWindowStart: data.bookingWindowStart,
        bookingWindowEnd: data.bookingWindowEnd,
        bookingDays: data.bookingDays,
      },
    });
    revalidatePath('/admin/labs');
    return { success: true };
  }
);

export const setEquipmentStatus = adminAction(
  async (_session, equipmentId: string, newStatus: 'AVAILABLE' | 'MAINTENANCE') => {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { usageLogs: { where: { endTime: null }, take: 1 } },
    });
    if (!equipment) throw new Error('Equipment not found');

    if (equipment.usageLogs.length > 0) {
      await prisma.usageLog.update({
        where: { id: equipment.usageLogs[0].id },
        data: { endTime: new Date() },
      });
    }

    await prisma.equipment.update({ where: { id: equipmentId }, data: { status: newStatus } });

    revalidatePath('/admin');
    revalidatePath(`/equipment/${equipmentId}`);
    return { success: true };
  }
);

export const adminScheduleMaintenance = adminAction(async (session, equipmentId: string, startIso: string, endIso: string) => {
  const requestedStart = new Date(startIso);
  const requestedEnd = new Date(endIso);

  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!equipment) throw new Error("Equipment not found");

  const booking = await prisma.booking.create({
    data: {
      equipmentId,
      // @ts-ignore
      userId: session.user.id,
      requestedStart,
      requestedEnd,
      reason: "MAINTENANCE",
      status: "APPROVED" 
    }
  });

  if (equipment.googleCalendarId) {
    try {
      const { createCalendarEvent } = await import('@/lib/calendar-service');
      const googleEventId = await createCalendarEvent({
        googleCalendarId: equipment.googleCalendarId,
        eventName: `⚠️ MAINTENANCE: ${equipment.name}`,
        // @ts-ignore
        userName: session.user.name || session.user.email || 'Admin',
        startTime: requestedStart,
        endTime: requestedEnd
      });

      if (googleEventId) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { googleEventId }
        });
      }
    } catch (error) {
      console.error("Failed to push Maintenance to Google Calendar:", error);
    }
  }

  revalidatePath(`/admin/equipment/${equipmentId}/schedule`);
});
