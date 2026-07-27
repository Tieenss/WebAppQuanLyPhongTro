"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Settings, Bell, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/management", label: "Quản lý", icon: Settings },
    { href: "/notifications", label: "Thông báo", icon: Bell },
    { href: "/profile", label: "Cá nhân", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-primary text-white rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50 overflow-hidden pb-safe">
      <div className="flex justify-around items-center h-20 px-2 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
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
              <item.icon size={24} className={isActive ? "transform scale-110" : "transform scale-100"} />
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
