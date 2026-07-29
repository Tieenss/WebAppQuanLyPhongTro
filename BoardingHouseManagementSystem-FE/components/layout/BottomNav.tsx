"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Settings, Bell, User, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWebSocket } from "@/components/providers/WebSocketProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { unreadCount } = useWebSocket();

  // Các đường dẫn cho từng quyền
  const landlordLinks = [
    { href: "/landlord/dashboard", label: "Home", icon: Home },
    { href: "/landlord/chat", label: "Chat", icon: MessageCircle },
    { href: "/landlord/management", label: "Quản lý", icon: Settings },
    { href: "/landlord/notifications", label: "Thông báo", icon: Bell },
    { href: "/landlord/profile", label: "Cá nhân", icon: User },
  ];

  const tenantLinks = [
    { href: "/tenant/dashboard", label: "Home", icon: Home },
    { href: "/tenant/chat", label: "Chat", icon: MessageCircle },
    { href: "/tenant/management", label: "Quản lý", icon: Settings },
    { href: "/tenant/notifications", label: "Thông báo", icon: Bell },
    { href: "/tenant/profile", label: "Cá nhân", icon: User },
  ];
  
  const adminLinks = [
    { href: "/admin/dashboard", label: "Home", icon: Home },
    { href: "/admin/management", label: "Quản lý", icon: Settings },
    { href: "/admin/profile", label: "Cá nhân", icon: User },
  ];

  const defaultLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/management", label: "Quản lý", icon: Settings },
    { href: "/notifications", label: "Thông báo", icon: Bell },
    { href: "/profile", label: "Cá nhân", icon: User },
  ];

  let navItems = defaultLinks;
  if (role === "LANDLORD") navItems = landlordLinks;
  else if (role === "TENANT") navItems = tenantLinks;
  else if (role === "ADMIN") navItems = adminLinks;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-primary text-white rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50 overflow-hidden pb-safe">
      <div className="flex justify-around items-center h-20 px-2 relative">
        {navItems.map((item) => {
          let isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));
          
          if (item.href.endsWith("/management") && !isActive) {
            const managementPaths = ["/building", "/room", "/tenant-management", "/contract", "/invoice", "/report", "/service"];
            const isManagementSubPage = managementPaths.some(path => pathname?.includes(path));
            if (isManagementSubPage) {
              isActive = true;
            }
          }

          const isNotification = item.label === "Thông báo";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative ${
                isActive ? "text-white" : "text-blue-200 hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute top-1 w-10 h-10 bg-white/20 rounded-full -z-10 animate-ping opacity-20" />
              )}
              {isActive && (
                <div className="absolute top-1 w-10 h-10 bg-white/20 rounded-full -z-10" />
              )}
              <div className="relative">
                <item.icon size={24} className={isActive ? "transform scale-110" : "transform scale-100"} />
                {isNotification && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-primary">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "opacity-100" : "opacity-80"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
