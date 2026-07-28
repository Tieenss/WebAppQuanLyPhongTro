"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Settings, Bell, User } from "lucide-react";
import type { UserRole } from "@/types/auth";

const landlordLinks = [
  { href: "/landlord/dashboard", label: "Home", icon: Home }, 
  { href: "/landlord/chat", label: "Chat", icon: MessageSquare }, 
  { href: "/landlord/management", label: "Quản lý", icon: Settings }, 
  { href: "/landlord/notifications", label: "Thông báo", icon: Bell }, 
  { href: "/landlord/profile", label: "Cá nhân", icon: User }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const links = landlordLinks;
  
  return (
    <aside className="border-b bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r flex flex-col">
      <div className="flex h-16 items-center gap-2 px-4 font-bold text-xl text-blue-600">Thuê Trọ</div>
      <nav className="flex-1 flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:py-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link 
              key={href} 
              href={href} 
              data-active={isActive}
              className="flex shrink-0 items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors data-[active=true]:bg-blue-600 data-[active=true]:text-white"
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 w-full text-sm font-medium text-slate-600 hover:text-slate-900">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">N</div>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
