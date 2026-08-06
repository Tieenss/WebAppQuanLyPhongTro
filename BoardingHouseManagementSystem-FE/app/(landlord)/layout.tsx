import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function LandlordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toUpperCase();
  if (!session || (userRole !== "LANDLORD" && userRole !== "ADMIN")) redirect("/login");
  const isAdmin = userRole === "ADMIN";
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <DashboardSidebar role="LANDLORD" isAdmin={isAdmin} />
      <main className="flex-1 bg-slate-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
