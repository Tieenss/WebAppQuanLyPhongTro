import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function LandlordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toUpperCase();
  if (!session || (userRole !== "LANDLORD" && userRole !== "ADMIN")) redirect("/login");
  return <div className="min-h-screen md:flex"><main className="flex-1 p-4 sm:p-6">{children}</main></div>;
}
