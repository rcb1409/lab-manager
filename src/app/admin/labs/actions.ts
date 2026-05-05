"use server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function addLab(data: { name: string; building: string; room: string }) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') throw new Error("Unauthorized");

  await prisma.lab.create({
    data: {
      name: data.name,
      building: data.building,
      room: data.room
    }
  });

  revalidatePath('/admin/labs');
  revalidatePath('/admin/equipment');
  revalidatePath('/equipment');
}
