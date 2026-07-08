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

  const bookings = await prisma.booking.findMany({
    orderBy: { requestedStart: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      equipment: { select: { name: true, lab: { select: { name: true } } } },
    },
  });

  const csv = toCsv(bookings, [
    { header: "Lab", value: (r) => r.equipment.lab.name },
    { header: "Equipment", value: (r) => r.equipment.name },
    { header: "User Name", value: (r) => r.user.name ?? "" },
    { header: "User Email", value: (r) => r.user.email },
    { header: "Requested Start", value: (r) => r.requestedStart.toISOString() },
    { header: "Requested End", value: (r) => r.requestedEnd.toISOString() },
    { header: "Status", value: (r) => r.status },
    { header: "Reason", value: (r) => r.reason ?? "" },
  ]);

  return csvResponse(`bookings-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
