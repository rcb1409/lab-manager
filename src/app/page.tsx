import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/equipment");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pt-10">
      <h1 className="text-4xl md:text-5xl font-slab font-bold text-gray-900 tracking-tight mb-6 max-w-3xl leading-tight">
        University Lab Equipment <span className="text-ncsu-red block mt-2">Management System</span>
      </h1>

      <p className="text-base text-gray-700 leading-relaxed max-w-2xl mx-auto mb-10">
        Scan QR codes on lab equipment, securely authenticate with your university email, and log your usage time automatically.
      </p>

      <div className="bg-yellow-50 border border-yellow-200 shadow-sm p-4 rounded max-w-lg mx-auto">
        <p className="text-sm text-yellow-800 font-medium">
          You are not signed in. Click "Sign In" in the header to get started.
          Ensure you use your official university account.
        </p>
      </div>
    </div>
  );
}
