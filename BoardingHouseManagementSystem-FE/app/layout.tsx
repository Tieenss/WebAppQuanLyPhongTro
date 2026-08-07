import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { WebSocketProvider } from "@/components/providers/WebSocketProvider";
import { AppToaster } from "@/components/ui/sonner";

import ChatWidget from "@/components/chat/ChatWidget";
import { MainLayout } from "@/components/layout/MainLayout";
import { SWRProvider } from "@/app/components/SWRProvider";

export const metadata: Metadata = { title: "Nhà Trọ SaaS", description: "Hệ thống quản lý phòng trọ" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <SWRProvider>
            <WebSocketProvider>
              <MainLayout>
                {children}
                <AppToaster />
                <ChatWidget />
              </MainLayout>
            </WebSocketProvider>
          </SWRProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
