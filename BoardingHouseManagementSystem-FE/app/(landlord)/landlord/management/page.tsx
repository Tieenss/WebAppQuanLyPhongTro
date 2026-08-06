"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Building2, Home, Users, FileText, ReceiptText, AlertTriangle, Package } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/apiClient";
import { useSession } from "next-auth/react";

export default function ManagementDashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || (session?.user as any)?.fullName || (session?.user as any)?.username || "bạn";
  const userRole = session?.user?.role === "LANDLORD" ? "Chủ trọ" : session?.user?.role === "ADMIN" ? "Quản trị viên" : "Người dùng";

  const [searchQuery, setSearchQuery] = useState("");

  const { data: buildingsRes } = useSWR("/buildings", fetcher);
  const { data: summaryRes } = useSWR("/dashboard/summary", fetcher);

  const managedBuildings = buildingsRes || [];
  
  const counts = useMemo(() => ({
    buildings: summaryRes?.buildingsCount || 0,
    rooms: summaryRes?.roomsCount || 0,
    tenants: summaryRes?.tenantsCount || 0,
    contracts: summaryRes?.contractsCount || 0,
    invoices: summaryRes?.invoicesCount || 0,
    issues: summaryRes?.issuesCount || 0,
    services: summaryRes?.servicesCount || 0,
  }), [summaryRes]);

  const cards = [
    { href: "/landlord/building", label: "Quản lý nhà trọ", icon: Home, color: "text-indigo-500", bgColor: "bg-indigo-100", count: counts.buildings },
    { href: "/landlord/room", label: "Quản lý phòng", icon: Building2, color: "text-blue-500", bgColor: "bg-blue-100", count: counts.rooms },
    { href: "/landlord/tenants", label: "Quản lý người thuê", icon: Users, color: "text-emerald-500", bgColor: "bg-emerald-100", count: counts.tenants },
    { href: "/landlord/contract", label: "Quản lý hợp đồng", icon: FileText, color: "text-amber-500", bgColor: "bg-amber-100", count: counts.contracts },
    { href: "/landlord/invoices", label: "Hoá đơn & Thanh toán", icon: ReceiptText, color: "text-rose-500", bgColor: "bg-rose-100", count: counts.invoices },
    { href: "/landlord/issues", label: "Quản lý báo cáo sự cố", icon: AlertTriangle, color: "text-orange-500", bgColor: "bg-orange-100", count: counts.issues },
    { href: "/landlord/services", label: "Quản lý gói dịch vụ", icon: Package, color: "text-cyan-500", bgColor: "bg-cyan-100", count: counts.services },
  ];

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    return cards.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [cards, searchQuery]);

  const displayedBuildings = useMemo(() => {
    if (managedBuildings.length === 0) return "Chưa có nhà trọ nào";
    const names = managedBuildings.map((b: any) => b.name);
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} và ${names.length - 2} nhà trọ khác`;
  }, [managedBuildings]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Banner Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
        {/* Abstract shapes for background decoration */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M42.7,-73.4C56.3,-66.6,68.9,-56.3,77.7,-43.3C86.5,-30.3,91.5,-15.1,90.4,-0.6C89.4,13.9,82.3,27.8,73.5,40.8C64.7,53.8,54.1,65.8,40.9,73.4C27.7,81,11.8,84,-3.3,89.5C-18.4,95,-32.7,103.1,-44.6,97C-56.5,90.8,-66,70.5,-73.9,53.2C-81.8,35.9,-88.2,21.5,-89.6,6.6C-91.1,-8.3,-87.6,-23.7,-80.1,-37.1C-72.6,-50.5,-61.2,-61.9,-47.9,-69.1C-34.6,-76.3,-19.4,-79.3,-2.6,-74.9C14.1,-70.5,29.1,-80.2,42.7,-73.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold flex items-center gap-3">
            Chào mừng trở lại, {userName}! <span className="animate-bounce" role="img" aria-label="wave">👋</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-blue-100">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold border border-white/10 shadow-sm">
              {userRole}
            </span>
            <span className="hidden sm:inline opacity-60">•</span>
            <p className="text-sm md:text-base font-medium">
              Đang quản lý: {" "}
              <span 
                className="text-white font-bold cursor-help border-b border-dashed border-white/40 pb-0.5 hover:border-white transition-colors" 
                title={managedBuildings.map((b: any) => b.name).join("\n")}
              >
                {displayedBuildings}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Truy cập nhanh</h2>
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" 
              placeholder="Tìm kiếm chức năng quản lý..." 
            />
          </div>
        </div>

        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link 
                  key={card.href} 
                  href={card.href}
                  className="group flex flex-col p-6 rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${card.bgColor} transition-transform duration-300 group-hover:scale-110 shadow-inner`}>
                      <Icon className={`w-8 h-8 ${card.color}`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {card.count > 0 ? (
                        <span className={`bg-slate-50 border border-slate-100 ${card.color} text-sm font-bold px-3 py-1 rounded-full shadow-sm`}>
                          {card.count}
                        </span>
                      ) : (
                        <span className="bg-slate-50 border border-slate-100 text-slate-400 text-sm font-medium px-3 py-1 rounded-full">
                          0
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-lg group-hover:text-blue-700 transition-colors">
                      {card.label}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shrink-0 ml-2">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
            <div className="bg-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700">Không tìm thấy chức năng</h3>
            <p className="text-slate-500 mt-2 text-base">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
