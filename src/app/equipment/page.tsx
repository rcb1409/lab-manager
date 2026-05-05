import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DirectoryClient } from "./DirectoryClient";

const prisma = new PrismaClient();

export default async function EquipmentList() {
  const session = await getServerSession(authOptions);
  
  const labs = await prisma.lab.findMany({
    include: { equipment: true },
    orderBy: { name: 'asc' }
  });

  return (
    <DirectoryClient labs={labs} hasSession={!!session} />
  );
}
