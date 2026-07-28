"use client";

import Link from "next/link";
import { Building2, Home, Users, FileText, ReceiptText, AlertTriangle, Package } from "lucide-react";

export default function ManagementDashboardPage() {
  const cards = [
    { href: "/landlord/building", label: "Quản lý nhà trọ", icon: Home, color: "text-red-500", bgColor: "bg-red-100", count: 0 },
    { href: "/landlord/room", label: "Quản lý phòng", icon: Building2, color: "text-blue-500", bgColor: "bg-blue-100", count: 0 },
    { href: "/landlord/tenant", label: "Quản lý người thuê", icon: Users, color: "text-blue-600", bgColor: "bg-blue-100", count: 0 },
    { href: "/landlord/contracts", label: "Quản lý hợp đồng", icon: FileText, color: "text-orange-500", bgColor: "bg-orange-100", count: 0 },
    { href: "/landlord/invoices", label: "Hoá đơn & Thanh toán", icon: ReceiptText, color: "text-blue-700", bgColor: "bg-blue-100", count: 0 },
    { href: "/landlord/issues", label: "Quản lý báo cáo sự cố", icon: AlertTriangle, color: "text-yellow-600", bgColor: "bg-yellow-100", count: 0 },
    { href: "/landlord/services", label: "Quản lý gói dịch vụ", icon: Package, color: "text-cyan-500", bgColor: "bg-cyan-100", count: 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Hi Tieenss! <span role="img" aria-label="wave">👋</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Chủ trọ</p>
        <p className="text-slate-600 mt-2">
          Đang quản lý nhà trọ: <span className="text-blue-600 font-medium">Thiên Đường</span>
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
          placeholder="Tìm kiếm..." 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link 
              key={card.href} 
              href={card.href}
              className="flex items-center justify-between p-4 rounded-xl border bg-purple-50 hover:bg-purple-100 hover:border-purple-200 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className="font-medium text-slate-700 text-sm">{card.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-red-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">{card.count}</span>
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
