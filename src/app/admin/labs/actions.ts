"use server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { adminAction } from "@/lib/action-utils";

const prisma = new PrismaClient();

export const updateLabAvailability = adminAction(
  async (
    _session,
    labId: string,
    data: { bookingWindowStart: string | null; bookingWindowEnd: string | null; bookingDays: string | null }
  ) => {
    await prisma.lab.update({
      where: { id: labId },
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

export async function addLab(data: { name: string; building: string; room: string; description?: string; imageUrl?: string }) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') throw new Error("Unauthorized");

  await prisma.lab.create({
    data: {
      name: data.name,
      building: data.building,
      room: data.room,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
    }
  });

  revalidatePath('/admin/labs');
  revalidatePath('/admin/equipment');
  revalidatePath('/equipment');
}

export const updateLab = adminAction(
  async (
    _session,
    labId: string,
    data: { name: string; building: string; room: string; description?: string; imageUrl?: string }
  ) => {
    await prisma.lab.update({
      where: { id: labId },
      data: {
        name: data.name,
        building: data.building,
        room: data.room,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
      },
    });

    revalidatePath('/admin/labs');
    revalidatePath('/admin/equipment');
    revalidatePath('/equipment');
    revalidatePath(`/labs/${labId}`);
  }
);

export const deleteLab = adminAction(async (_session, labId: string) => {
  await prisma.lab.delete({ where: { id: labId } });

  revalidatePath('/admin/labs');
  revalidatePath('/admin/equipment');
  revalidatePath('/equipment');
});
