"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Settings, Bell, User, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

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

  // Lựa chọn danh sách link tương ứng
  let navItems = defaultLinks;
  if (role === "LANDLORD") navItems = landlordLinks;
  else if (role === "TENANT") navItems = tenantLinks;
  else if (role === "ADMIN") navItems = adminLinks;

  return (
    <div className="hidden md:flex flex-col w-64 bg-white shadow-lg h-screen fixed top-0 left-0 border-r border-slate-100 z-40">
      <div className="flex items-center justify-center h-24 border-b border-slate-50">
        <h1 className="text-2xl font-bold text-primary tracking-wide">Thuê Trọ</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          // Logic xác định link đang active
          // So khớp chính xác hoặc nếu là menu cha thì bắt đầu bằng href (ngoại trừ Home)
          let isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));
          
          // Logic đặc biệt cho menu "Quản lý" vì các trang con không nằm trong /management/...
          if (item.href.endsWith("/management") && !isActive) {
            const managementPaths = ["/building", "/room", "/tenant-management", "/contract", "/invoice", "/report", "/service"];
            const isManagementSubPage = managementPaths.some(path => pathname?.includes(path));
            if (isManagementSubPage) {
              isActive = true;
            }
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-blue-200 translate-x-1"
                  : "text-slate-500 hover:bg-sky-50 hover:text-primary"
              }`}
            >
              <item.icon size={22} className={isActive ? "animate-pulse" : ""} />
              <span className="font-semibold text-[15px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-slate-50">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center space-x-4 px-6 py-4 rounded-2xl w-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={22} />
          <span className="font-semibold text-[15px]">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
