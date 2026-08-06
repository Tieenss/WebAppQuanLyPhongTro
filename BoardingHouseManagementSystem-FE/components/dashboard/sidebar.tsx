"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Settings, Bell, User, FileText, AlertTriangle, ReceiptText, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { UserRole } from "@/types/auth";
import { useWebSocket } from "@/components/providers/WebSocketProvider";

const landlordLinks = [
  { href: "/landlord/dashboard", label: "Home", icon: Home }, 
  { href: "/landlord/chat", label: "Chat", icon: MessageSquare }, 
  { href: "/landlord/management", label: "Quản lý", icon: Settings }, 
  { href: "/landlord/notifications", label: "Thông báo", icon: Bell }, 
  { href: "/landlord/profile", label: "Cá nhân", icon: User }
];

const tenantLinks = [
  { href: "/tenant/dashboard", label: "Home", icon: Home }, 
  { href: "/tenant/contract", label: "Hợp đồng", icon: FileText },
  { href: "/tenant/invoices", label: "Hóa đơn", icon: ReceiptText },
  { href: "/tenant/issues", label: "Sự cố", icon: AlertTriangle }, 
  { href: "/tenant/chat", label: "Chat", icon: MessageSquare }, 
  { href: "/tenant/notifications", label: "Thông báo", icon: Bell }, 
  { href: "/tenant/profile", label: "Cá nhân", icon: User }
];

export function DashboardSidebar({ role = "LANDLORD", isAdmin = false }: { role?: "LANDLORD" | "TENANT" | "ADMIN" | string, isAdmin?: boolean }) {
  const pathname = usePathname();
  const { unreadCount } = useWebSocket();
  const links = role === "TENANT" ? tenantLinks : landlordLinks;
  
  return (
    <aside className="border-b bg-white md:min-h-screen md:w-64 md:border-b-0 flex flex-col shadow-[1px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 relative">
      <div className="flex h-16 items-center gap-2 px-6 font-extrabold text-xl text-blue-600 tracking-tight">Thuê Trọ</div>
      <nav className="flex-1 flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:py-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link 
              key={href} 
              href={href} 
              data-active={isActive}
              className="flex shrink-0 items-center justify-between rounded-md px-4 py-3 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors data-[active=true]:bg-blue-600 data-[active=true]:text-white"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {label}
              </div>
              {href.includes("/notifications") && unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-200 space-y-1">
            <Link 
              href="/admin/dashboard" 
              className="flex shrink-0 items-center gap-3 rounded-md px-4 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Settings className="h-5 w-5" />
              Về trang Admin
            </Link>
          </div>
        )}
      </nav>
      <div className="p-4 border-t">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center justify-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
