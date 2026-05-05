"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { adminAction } from "@/lib/action-utils";

const prisma = new PrismaClient();

export const approveBooking = adminAction(async (session, bookingId: string) => {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { 
      status: 'APPROVED',
      // @ts-ignore
      approvedById: session.user.id 
    },
    include: { equipment: true, user: true }
  });

  if (booking.equipment.googleCalendarId) {
    try {
      const { createCalendarEvent } = await import('@/lib/calendar-service');
      const googleEventId = await createCalendarEvent({
        googleCalendarId: booking.equipment.googleCalendarId,
        eventName: `Reserved: ${booking.equipment.name}`,
        userName: booking.user.name || booking.user.email || 'Unknown User',
        startTime: booking.requestedStart,
        endTime: booking.requestedEnd
      });

      if (googleEventId) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { googleEventId }
        });
      }
    } catch (e) {
      console.error("Failed to connect to Google Calendar", e);
    }
  }

  revalidatePath('/admin/bookings');
});

export const denyBooking = adminAction(async (session, bookingId: string) => {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { 
      status: 'DENIED',
      // @ts-ignore
      approvedById: session.user.id 
    },
    include: { equipment: true }
  });

  if (booking.googleEventId && booking.equipment.googleCalendarId) {
    try {
      const { deleteCalendarEvent } = await import('@/lib/calendar-service');
      await deleteCalendarEvent({
        googleCalendarId: booking.equipment.googleCalendarId,
        eventId: booking.googleEventId
      });
    } catch (e) {
      console.error("Failed to delete from google calendar", e);
    }
  }

  revalidatePath('/admin/bookings');
});
