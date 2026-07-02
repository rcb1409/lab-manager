"use server"

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { userAction } from "@/lib/action-utils";
import { checkCalendarAvailability, createCalendarEvent, updateCalendarEvent } from "@/lib/calendar-service";

const prisma = new PrismaClient();

export const startSession = userAction(async (session: any, equipmentId: string, tentativeEndIso: string) => {

  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (equipment?.status !== 'AVAILABLE') throw new Error("Equipment is not available");

  const startTime = new Date();
  const tentativeEndTime = new Date(tentativeEndIso);

  // 1. Collision detection with APPROVED future bookings
  let hasCollision = false;

  const overlappingBookings = await prisma.booking.findMany({
    where: {
      equipmentId,
      status: 'APPROVED',
      requestedStart: { lt: tentativeEndTime },
      requestedEnd: { gt: startTime },
    }
  });

  if (overlappingBookings.length > 0) hasCollision = true;

  if (!hasCollision && equipment.googleCalendarId) {
    try {
      hasCollision = await checkCalendarAvailability(equipment.googleCalendarId, startTime, tentativeEndTime);
    } catch (e) {
      console.error(e);
    }
  }

  if (hasCollision) {
    throw new Error("This equipment is scheduled for an approved booking during your time frame. Please select an earlier end time.");
  }

  // 2. Push to Google Calendar
  let googleEventId = null;
  // @ts-ignore
  if (equipment.googleCalendarId) {
    try {
      googleEventId = await createCalendarEvent({
        // @ts-ignore
        googleCalendarId: equipment.googleCalendarId,
        eventName: `Walk-In Usage: ${equipment.name}`,
        // @ts-ignore
        userName: session.user.name || session.user.email || 'Unknown User',
        startTime: startTime,
        endTime: tentativeEndTime
      });
    } catch (error) {
      console.error("Failed to sync Walk-In to Google Calendar:", error);
    }
  }

  await prisma.usageLog.create({
    data: {
      equipmentId,
      // @ts-ignore
      userId: session.user.id,
      startTime: startTime,
      googleEventId: googleEventId
    }
  });

  await prisma.equipment.update({
    where: { id: equipmentId },
    data: { status: 'IN_USE' }
  });

  revalidatePath(`/equipment/${equipmentId}`);
});

export const endSession = userAction(async (session: any, usageLogId: string, equipmentId: string, notes: string) => {

  const endTime = new Date();

  // Patch Google Calendar
  const usageLog = await prisma.usageLog.findUnique({
    where: { id: usageLogId },
    include: { equipment: true }
  });

  // @ts-ignore
  if (usageLog?.googleEventId && usageLog.equipment.googleCalendarId) {
    try {
      await updateCalendarEvent({
        // @ts-ignore
        googleCalendarId: usageLog.equipment.googleCalendarId,
        eventId: usageLog.googleEventId,
        startTime: usageLog.startTime,
        endTime: endTime
      });
    } catch (e) {
      console.error("Failed to patch Google Calendar end time:", e);
    }
  }

  await prisma.usageLog.update({
    where: { id: usageLogId },
    data: { 
      endTime: endTime,
      notes 
    }
  });

  await prisma.equipment.update({
    where: { id: equipmentId },
    data: { status: 'AVAILABLE' }
  });

  revalidatePath(`/equipment/${equipmentId}`);
});

export const requestBooking = userAction(async (session: any, equipmentId: string, startIso: string, endIso: string, reason: string) => {

  const requestedStart = new Date(startIso);
  const requestedEnd = new Date(endIso);

  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    include: { lab: true },
  });

  // Enforce booking window: equipment-level takes precedence over lab-level
  const eq = equipment as any;
  const lab = eq?.lab as any;
  const winStart: string | null = eq?.bookingWindowStart ?? lab?.bookingWindowStart ?? null;
  const winEnd: string | null = eq?.bookingWindowEnd ?? lab?.bookingWindowEnd ?? null;
  const winDays: string | null = eq?.bookingWindowStart
    ? (eq?.bookingDays ?? null)
    : (lab?.bookingDays ?? null);

  if (winStart && winEnd) {
    const toHHMM = (d: Date) => d.toTimeString().slice(0, 5);
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const fmt12 = (t: string) => {
      const [h, m] = t.split(":");
      const hr = +h;
      return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
    };
    const allowedDays = winDays
      ? new Set(winDays.split(","))
      : new Set(["0", "1", "2", "3", "4", "5", "6"]);
    const checkSlot = (dt: Date) =>
      allowedDays.has(dt.getDay().toString()) &&
      toHHMM(dt) >= winStart &&
      toHHMM(dt) <= winEnd;

    if (!checkSlot(requestedStart) || !checkSlot(requestedEnd)) {
      const dayStr = winDays
        ? winDays.split(",").map((d: string) => DAY_NAMES[+d]).join(", ")
        : "all days";
      return {
        status: "ERROR" as const,
        message: `Bookings are only allowed ${dayStr}, ${fmt12(winStart)} – ${fmt12(winEnd)}.`,
      };
    }
  }

  const overlappingBookings = await prisma.booking.findMany({
    where: {
      equipmentId,
      status: 'APPROVED',
      requestedStart: { lt: requestedEnd },
      requestedEnd: { gt: requestedStart },
    }
  });

  let status: "APPROVED" | "PENDING" = "APPROVED";
  let message = "Booking accepted successfully!";

  if (overlappingBookings.length > 0) {
    status = "PENDING";
  } else if (equipment?.googleCalendarId) {
    try {
      const hasCalendarClash = await checkCalendarAvailability(equipment.googleCalendarId, requestedStart, requestedEnd);
      if (hasCalendarClash) status = "PENDING";
    } catch (e) {
      console.error(e);
    }
  }

  if (status === "PENDING") {
    message = "This slot overlaps with an existing reservation or active walk-in. Your request has been forwarded to the Lab Manager for manual approval.";
  }

  const booking = await prisma.booking.create({
    data: {
      equipmentId,
      // @ts-ignore
      userId: session.user.id,
      requestedStart,
      requestedEnd,
      reason,
      status
    }
  });

  if (status === "APPROVED") {
    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (equipment?.googleCalendarId) {
      try {
        const googleEventId = await createCalendarEvent({
          googleCalendarId: equipment.googleCalendarId,
          eventName: `Reserved: ${equipment.name}`,
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
      } catch (error) {
        console.error("Failed to sync to Google Calendar:", error);
      }
    }
  }

  revalidatePath(`/equipment/${equipmentId}`);
  return { status, message };
});
