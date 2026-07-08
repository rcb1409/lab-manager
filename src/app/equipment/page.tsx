import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LabsDirectoryClient } from "./DirectoryClient";

const prisma = new PrismaClient();

export default async function LabsDirectoryPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const labs = await prisma.lab.findMany({
    include: { _count: { select: { equipment: true } } },
    orderBy: [{ building: 'asc' }, { name: 'asc' }],
  });

  let grantedLabIds = new Set<string>();
  let pendingLabIds = new Set<string>();

  if (userId && !isAdmin) {
    const [accesses, requests] = await Promise.all([
      prisma.labAccess.findMany({ where: { userId }, select: { labId: true } }),
      prisma.accessRequest.findMany({
        where: { userId, type: 'LAB', status: 'PENDING' },
        select: { labId: true },
      }),
    ]);
    grantedLabIds = new Set(accesses.map(a => a.labId));
    pendingLabIds = new Set(requests.map(r => r.labId).filter(Boolean) as string[]);
  }

  const labsWithAccess = labs.map(lab => ({
    id: lab.id,
    name: lab.name,
    building: lab.building,
    room: lab.room,
    description: (lab as any).description ?? null,
    imageUrl: (lab as any).imageUrl ?? null,
    equipmentCount: lab._count.equipment,
    hasAccess: isAdmin || grantedLabIds.has(lab.id),
    hasPendingRequest: pendingLabIds.has(lab.id),
  }));

  return (
    <LabsDirectoryClient
      labs={labsWithAccess}
      isLoggedIn={!!session}
      isAdmin={isAdmin}
    />
  );
}
