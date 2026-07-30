"use client";

import { usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  if (isAuthPage) {
    return <main className="min-h-screen w-full flex items-center justify-center p-4">{children}</main>;
  }

  return <main className="min-h-screen w-full">{children}</main>;
}
