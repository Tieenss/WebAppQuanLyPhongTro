import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { authOptions } from "@/lib/auth";

export default async function TenantLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toUpperCase();
  if (!session || (userRole !== "TENANT" && userRole !== "ADMIN")) redirect("/login");
  const isAdmin = userRole === "ADMIN";
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <DashboardSidebar role="TENANT" isAdmin={isAdmin} />
      <main className="flex-1 bg-slate-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
