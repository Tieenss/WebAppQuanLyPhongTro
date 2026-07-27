"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageCircle, 
  Building2, 
  DoorOpen, 
  Users, 
  FileText, 
  Receipt, 
  Wrench, 
  Bell, 
  User, 
  LogOut 
} from "lucide-react";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/landlord/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { href: "/landlord/chat", label: "Tin nhắn", icon: MessageCircle },
    { href: "/landlord/buildings", label: "Tòa nhà", icon: Building2 },
    { href: "/landlord/rooms", label: "Phòng trọ", icon: DoorOpen },
    { href: "/landlord/tenants", label: "Khách thuê", icon: Users },
    { href: "/landlord/contracts", label: "Hợp đồng", icon: FileText },
    { href: "/landlord/invoices", label: "Hóa đơn", icon: Receipt },
    { href: "/landlord/issues", label: "Sự cố", icon: Wrench },
    { href: "/landlord/notifications", label: "Thông báo", icon: Bell },
    { href: "/landlord/profile", label: "Cá nhân", icon: User },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white shadow-xl h-screen fixed top-0 left-0 border-r border-slate-100 z-40">
      <div className="flex items-center justify-center h-20 border-b border-slate-100 bg-slate-50/50">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-2 shadow-sm">
          H
        </div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">HouseRental</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 mt-2">Menu Quản Lý</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200/50 translate-x-1"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon size={20} className={isActive ? "animate-pulse" : "group-hover:scale-110 transition-transform"} />
              <span className="font-medium text-[15px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
