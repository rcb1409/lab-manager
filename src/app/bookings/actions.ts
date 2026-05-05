"use server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { userAction } from "@/lib/action-utils";

const prisma = new PrismaClient();

export const cancelBooking = userAction(async (session: any, bookingId: string) => {
  const booking = await prisma.booking.findUnique({ 
    where: { id: bookingId },
    include: { equipment: true }
  });
  // @ts-ignore
  if (!booking || booking.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  if (booking.googleEventId && booking.equipment.googleCalendarId) {
    try {
      const { deleteCalendarEvent } = await import('@/lib/calendar-service');
      await deleteCalendarEvent({
          googleCalendarId: booking.equipment.googleCalendarId,
          eventId: booking.googleEventId
      });
    } catch (e) {
      console.error("Failed to delete from calendar", e);
    }
  }

  await prisma.booking.delete({ where: { id: bookingId } });
  revalidatePath('/bookings');
});

export const rescheduleBooking = userAction(async (session: any, bookingId: string, startIso: string, endIso: string) => {

  const booking = await prisma.booking.findUnique({ 
    where: { id: bookingId },
    include: { equipment: true }
  });
  
  // @ts-ignore
  if (!booking || booking.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const requestedStart = new Date(startIso);
  const requestedEnd = new Date(endIso);

  const overlappingBookings = await prisma.booking.findMany({
    where: {
      equipmentId: booking.equipmentId,
      status: 'APPROVED',
      id: { not: bookingId }, // exclude this booking
      requestedStart: { lt: requestedEnd },
      requestedEnd: { gt: requestedStart },
    }
  });

  if (overlappingBookings.length > 0) {
    throw new Error("This timeslot is already occupied. Reschedule failed.");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      requestedStart,
      requestedEnd,
      status: 'APPROVED' 
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
  } else if (!booking.googleEventId && booking.equipment.googleCalendarId) {
    try {
      const { createCalendarEvent } = await import('@/lib/calendar-service');
      const googleEventId = await createCalendarEvent({
        googleCalendarId: booking.equipment.googleCalendarId,
        eventName: `Reserved: ${booking.equipment.name}`,
        // @ts-ignore
        userName: session.user.name || session.user.email || 'Unknown User',
        startTime: requestedStart,
        endTime: requestedEnd
      });
      if (googleEventId) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { googleEventId }
        });
      }
    } catch (e) {
       console.error("Failed to build new event", e);
    }
  }

  revalidatePath('/bookings');
  revalidatePath(`/equipment/${booking.equipmentId}`);
});
