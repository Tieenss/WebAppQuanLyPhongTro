import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function LandlordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toUpperCase();
  if (!session || (userRole !== "LANDLORD" && userRole !== "ADMIN")) redirect("/login");
  return <>{children}</>;
}
