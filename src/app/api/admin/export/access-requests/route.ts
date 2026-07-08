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

  const requests = await prisma.accessRequest.findMany({
    orderBy: { requestedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      lab: { select: { name: true } },
      equipment: { select: { name: true, lab: { select: { name: true } } } },
      resolvedBy: { select: { name: true, email: true } },
    },
  });

  const csv = toCsv(requests, [
    { header: "Type", value: (r) => r.type },
    { header: "Resource", value: (r) => r.lab?.name ?? r.equipment?.name ?? "" },
    { header: "Lab", value: (r) => r.lab?.name ?? r.equipment?.lab.name ?? "" },
    { header: "User Name", value: (r) => r.user.name ?? "" },
    { header: "User Email", value: (r) => r.user.email },
    { header: "Status", value: (r) => r.status },
    { header: "Message", value: (r) => r.message ?? "" },
    { header: "Requested At", value: (r) => r.requestedAt.toISOString() },
    { header: "Resolved At", value: (r) => (r.resolvedAt ? r.resolvedAt.toISOString() : "") },
    { header: "Resolved By", value: (r) => r.resolvedBy?.name ?? r.resolvedBy?.email ?? "" },
  ]);

  return csvResponse(`access-requests-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
