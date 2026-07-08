import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { toCsv, csvResponse } from "@/lib/csv";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 403 });
  }

  const logs = await prisma.usageLog.findMany({
    orderBy: { startTime: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      equipment: { select: { name: true, lab: { select: { name: true } } } },
    },
  });

  const csv = toCsv(logs, [
    { header: "Lab", value: (r) => r.equipment.lab.name },
    { header: "Equipment", value: (r) => r.equipment.name },
    { header: "User Name", value: (r) => r.user.name ?? "" },
    { header: "User Email", value: (r) => r.user.email },
    { header: "Start Time", value: (r) => r.startTime.toISOString() },
    { header: "End Time", value: (r) => (r.endTime ? r.endTime.toISOString() : "") },
    { header: "Notes", value: (r) => r.notes ?? "" },
  ]);

  return csvResponse(`usage-logs-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
