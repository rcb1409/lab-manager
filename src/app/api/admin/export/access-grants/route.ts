import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { toCsv, csvResponse } from "@/lib/csv";

const prisma = new PrismaClient();

type GrantRow = {
  type: "LAB" | "EQUIPMENT";
  resource: string;
  userName: string | null;
  userEmail: string;
  grantedBy: string;
  grantedAt: Date;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 403 });
  }

  const [labAccesses, equipmentAccesses] = await Promise.all([
    prisma.labAccess.findMany({
      orderBy: { grantedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        lab: { select: { name: true } },
        grantedBy: { select: { name: true, email: true } },
      },
    }),
    prisma.equipmentAccess.findMany({
      orderBy: { grantedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        equipment: { select: { name: true, lab: { select: { name: true } } } },
        grantedBy: { select: { name: true, email: true } },
      },
    }),
  ]);

  const rows: GrantRow[] = [
    ...labAccesses.map((a) => ({
      type: "LAB" as const,
      resource: a.lab.name,
      userName: a.user.name,
      userEmail: a.user.email,
      grantedBy: a.grantedBy?.name ?? a.grantedBy?.email ?? "",
      grantedAt: a.grantedAt,
    })),
    ...equipmentAccesses.map((a) => ({
      type: "EQUIPMENT" as const,
      resource: `${a.equipment.name} (${a.equipment.lab.name})`,
      userName: a.user.name,
      userEmail: a.user.email,
      grantedBy: a.grantedBy?.name ?? a.grantedBy?.email ?? "",
      grantedAt: a.grantedAt,
    })),
  ].sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime());

  const csv = toCsv(rows, [
    { header: "Type", value: (r) => r.type },
    { header: "Resource", value: (r) => r.resource },
    { header: "User Name", value: (r) => r.userName ?? "" },
    { header: "User Email", value: (r) => r.userEmail },
    { header: "Granted By", value: (r) => r.grantedBy },
    { header: "Granted At", value: (r) => r.grantedAt.toISOString() },
  ]);

  return csvResponse(`access-grants-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
