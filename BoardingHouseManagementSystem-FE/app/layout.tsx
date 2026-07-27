import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { AppToaster } from "@/components/ui/sonner";

import { MainLayout } from "@/components/layout/MainLayout";

export const metadata: Metadata = { title: "Nhà Trọ SaaS", description: "Hệ thống quản lý phòng trọ" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <MainLayout>
            {children}
            <AppToaster />
          </MainLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
