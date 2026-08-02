"use client";

import Link from "next/link";
import { Users, Building2, UserCircle, LogOut } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/apiClient";
import { signOut } from "next-auth/react";

export default function AdminDashboardPage() {
  const { data: usersRes } = useSWR("/users", fetcher);
  const users = usersRes || [];
  
  const landlordCount = users.filter((u: any) => u.role === "LANDLORD").length;
  const tenantCount = users.filter((u: any) => u.role === "TENANT").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng quan Quản trị viên</h2>
          <p className="text-slate-600 mt-1">Trang này dành cho Admin để quản lý toàn bộ hệ thống.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Link href="/admin/users" className="bg-indigo-50 hover:bg-indigo-100 transition-colors p-6 rounded-2xl shadow-sm border border-indigo-100 flex flex-col items-center justify-center gap-3 group">
          <div className="bg-indigo-600 text-white p-3 rounded-full group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <span className="font-semibold text-indigo-900">Quản lý Tài khoản</span>
        </Link>

        <Link href="/landlord/dashboard" className="bg-orange-50 hover:bg-orange-100 transition-colors p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-center justify-center gap-3 group">
          <div className="bg-orange-500 text-white p-3 rounded-full group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="font-semibold text-orange-900">Đóng vai Chủ trọ</span>
        </Link>

        <Link href="/tenant/dashboard" className="bg-emerald-50 hover:bg-emerald-100 transition-colors p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col items-center justify-center gap-3 group">
          <div className="bg-emerald-500 text-white p-3 rounded-full group-hover:scale-110 transition-transform">
            <UserCircle className="w-6 h-6" />
          </div>
          <span className="font-semibold text-emerald-900">Đóng vai Khách thuê</span>
        </Link>
        
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="bg-slate-50 hover:bg-slate-100 transition-colors p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-3 group">
          <div className="bg-slate-600 text-white p-3 rounded-full group-hover:scale-110 transition-transform">
            <LogOut className="w-6 h-6" />
          </div>
          <span className="font-semibold text-slate-700">Đăng xuất</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Tổng số Chủ trọ</h3>
          <p className="text-3xl font-bold mt-2 text-primary">{landlordCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Tổng số Khách thuê</h3>
          <p className="text-3xl font-bold mt-2 text-primary">{tenantCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Doanh thu nền tảng</h3>
          <p className="text-3xl font-bold mt-2 text-primary">--</p>
        </div>
      </div>
    </div>
  );
}
