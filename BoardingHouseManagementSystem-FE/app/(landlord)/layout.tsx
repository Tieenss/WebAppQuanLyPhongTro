import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { authOptions } from "@/lib/auth";

export default async function LandlordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN")) redirect("/login");
  return <div className="min-h-screen md:flex"><DashboardSidebar role={session.user.role} /><main className="flex-1 p-4 sm:p-6">{children}</main></div>;
}
