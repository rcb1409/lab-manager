import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LabAccessGate } from "@/app/equipment/[id]/LabAccessGate";
import Link from "next/link";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function LabDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const lab = await prisma.lab.findUnique({
    where: { id },
    include: { equipment: { orderBy: { name: "asc" } } },
  });

  if (!lab) return notFound();

  let hasAccess = isAdmin;
  let hasPendingRequest = false;

  if (userId && !isAdmin) {
    const [access, pending] = await Promise.all([
      prisma.labAccess.findUnique({
        where: { userId_labId: { userId, labId: id } },
      }),
      prisma.accessRequest.findFirst({
        where: { userId, labId: id, type: "LAB", status: "PENDING" },
      }),
    ]);
    hasAccess = !!access;
    hasPendingRequest = !!pending;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/equipment"
        className="text-sm font-bold text-gray-500 hover:text-ncsu-red mb-6 inline-flex items-center gap-1 uppercase tracking-wide"
      >
        &larr; Labs Directory
      </Link>

      <div className="bg-ncsu-red text-white rounded-xl px-8 py-6 mt-4 mb-8 shadow-sm">
        <h1 className="text-3xl font-slab font-bold">{lab.name}</h1>
        <p className="mt-1 text-white/75 text-sm font-medium uppercase tracking-wide">
          {lab.building} &middot; Room {lab.room}
        </p>
      </div>

      {!session ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md text-sm text-yellow-700">
          You must sign in with your university account to request access and
          view equipment in this lab.
        </div>
      ) : !hasAccess ? (
        <LabAccessGate
          labId={lab.id}
          labName={lab.name}
          hasPendingRequest={hasPendingRequest}
        />
      ) : (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Equipment{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({lab.equipment.length})
            </span>
          </h2>
          {lab.equipment.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">
              No equipment listed for this lab yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(lab.equipment as any[]).map(item => (
                <Link
                  key={item.id}
                  href={`/equipment/${item.id}`}
                  className="block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-ncsu-red/40 transition-shadow duration-200 p-4"
                >
                  <div className="pb-3 border-b border-gray-100 mb-3">
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{item.type}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {item.onboardingRequired && (
                      <span className="text-xs text-blue-600 font-medium">
                        Onboarding required
                      </span>
                    )}
                    <span
                      className={`ml-auto px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${
                        item.status === "AVAILABLE"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : item.status === "IN_USE"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
