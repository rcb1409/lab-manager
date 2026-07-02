'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { adminAction } from '@/lib/action-utils';

const prisma = new PrismaClient();

export const grantAccess = adminAction(async (session, requestId: string) => {
  const req = await prisma.accessRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });
  if (!req) throw new Error('Request not found');
  if (req.status !== 'PENDING') throw new Error('Request is no longer pending');

  const adminId = session.user.id as string;

  if (req.type === 'LAB' && req.labId) {
    await prisma.labAccess.upsert({
      where: { userId_labId: { userId: req.userId, labId: req.labId } },
      update: { grantedById: adminId, grantedAt: new Date() },
      create: { userId: req.userId, labId: req.labId, grantedById: adminId },
    });
  } else if (req.type === 'EQUIPMENT' && req.equipmentId) {
    await prisma.equipmentAccess.upsert({
      where: { userId_equipmentId: { userId: req.userId, equipmentId: req.equipmentId } },
      update: { grantedById: adminId, grantedAt: new Date() },
      create: { userId: req.userId, equipmentId: req.equipmentId, grantedById: adminId },
    });
  }

  await prisma.accessRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED', resolvedById: adminId, resolvedAt: new Date() },
  });

  revalidatePath('/admin/access');
  return { success: true };
});

export const denyAccess = adminAction(async (session, requestId: string) => {
  const req = await prisma.accessRequest.findUnique({ where: { id: requestId } });
  if (!req) throw new Error('Request not found');
  if (req.status !== 'PENDING') throw new Error('Request is no longer pending');

  await prisma.accessRequest.update({
    where: { id: requestId },
    data: {
      status: 'DENIED',
      resolvedById: session.user.id as string,
      resolvedAt: new Date(),
    },
  });

  revalidatePath('/admin/access');
  return { success: true };
});

export const revokeLabAccess = adminAction(async (_session, userId: string, labId: string) => {
  await prisma.labAccess.delete({
    where: { userId_labId: { userId, labId } },
  });
  revalidatePath('/admin/access');
  return { success: true };
});

export const revokeEquipmentAccess = adminAction(
  async (_session, userId: string, equipmentId: string) => {
    await prisma.equipmentAccess.delete({
      where: { userId_equipmentId: { userId, equipmentId } },
    });
    revalidatePath('/admin/access');
    return { success: true };
  }
);

export const updateOnboardingMaterials = adminAction(
  async (
    _session,
    equipmentId: string,
    onboardingRequired: boolean,
    onboardingMaterials: string
  ) => {
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { onboardingRequired, onboardingMaterials: onboardingMaterials || null },
    });
    revalidatePath('/admin/equipment');
    return { success: true };
  }
);
