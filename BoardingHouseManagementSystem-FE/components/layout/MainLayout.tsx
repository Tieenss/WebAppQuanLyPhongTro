"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";
  const isHomePage = pathname === "/";
  const isLandlordRoute = pathname.startsWith("/landlord");

  if (isAuthPage) {
    return <main className="min-h-screen w-full flex items-center justify-center p-4">{children}</main>;
  }

  if (isHomePage) {
    return <main className="min-h-screen w-full bg-slate-50">{children}</main>;
  }

  if (!isLandlordRoute) {
    // For non-landlord routes (like tenant or admin), we don't inject the Landlord Sidebar
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex h-screen bg-sky-50">
      <Sidebar />
      <div className="flex-1 md:ml-64 w-full h-full overflow-y-auto pb-24 md:pb-0">
        <main className="min-h-full max-w-7xl mx-auto">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
