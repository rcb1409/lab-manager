'use server';

import { PrismaClient } from '@prisma/client';
import { userAction } from '@/lib/action-utils';
import { notifyAdminAccessRequest } from '@/lib/email';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

async function getBaseUrl() {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export const requestLabAccess = userAction(async (session, labId: string, message: string) => {
  const userId = session.user.id as string;

  // Check if already has access
  const existing = await prisma.labAccess.findUnique({
    where: { userId_labId: { userId, labId } },
  });
  if (existing) return { success: false, error: 'You already have access to this lab.' };

  // Check for existing pending request
  const pending = await prisma.accessRequest.findFirst({
    where: { userId, labId, type: 'LAB', status: 'PENDING' },
  });
  if (pending) return { success: false, error: 'You already have a pending request for this lab.' };

  const lab = await prisma.lab.findUnique({ where: { id: labId } });
  if (!lab) return { success: false, error: 'Lab not found.' };

  await prisma.accessRequest.create({
    data: { userId, labId, type: 'LAB', status: 'PENDING', message },
  });

  await notifyAdminAccessRequest({
    requesterName: session.user.name || session.user.email,
    requesterEmail: session.user.email,
    type: 'LAB',
    targetName: lab.name,
    message,
    adminUrl: `${await getBaseUrl()}/admin/access`,
  });

  return { success: true };
});

export const requestEquipmentAccess = userAction(
  async (session, equipmentId: string, message: string) => {
    const userId = session.user.id as string;

    // Check if already has access
    const existing = await prisma.equipmentAccess.findUnique({
      where: { userId_equipmentId: { userId, equipmentId } },
    });
    if (existing) return { success: false, error: 'You already have access to this equipment.' };

    // Check for existing pending request
    const pending = await prisma.accessRequest.findFirst({
      where: { userId, equipmentId, type: 'EQUIPMENT', status: 'PENDING' },
    });
    if (pending) return { success: false, error: 'You already have a pending request for this equipment.' };

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { lab: { select: { name: true } } },
    });
    if (!equipment) return { success: false, error: 'Equipment not found.' };

    await prisma.accessRequest.create({
      data: { userId, equipmentId, type: 'EQUIPMENT', status: 'PENDING', message },
    });

    await notifyAdminAccessRequest({
      requesterName: session.user.name || session.user.email,
      requesterEmail: session.user.email,
      type: 'EQUIPMENT',
      targetName: equipment.name,
      labName: equipment.lab.name,
      message,
      adminUrl: `${await getBaseUrl()}/admin/access`,
    });

    return { success: true };
  }
);
