"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Receipt, AlertTriangle, Loader2, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export default function TenantDashboardPage() { 
  const { data: session } = useSession();
  const userName = session?.user?.name || (session?.user as any)?.fullName || (session?.user as any)?.username || "bạn";
  const userRole = "Người thuê phòng";

  const { data: contractsRes, isLoading: isLoadingContracts } = useSWR("/contracts", fetcher);
  const { data: invoicesRes, isLoading: isLoadingInvoices } = useSWR("/invoices", fetcher);
  const { data: issuesRes, isLoading: isLoadingIssues } = useSWR("/su-co", fetcher);

  const rawContracts = Array.isArray(contractsRes?.data) ? contractsRes.data : contractsRes?.data?.data || contractsRes || [];
  const invoices = invoicesRes || [];
  const issues = issuesRes || [];

  const activeContract = rawContracts.find((c: any) => c.status?.toLowerCase() === "dang_thue" || c.status?.toLowerCase() === "active");
  const unpaidInvoicesCount = invoices.filter((i: any) => i.status === "UNPAID" || i.status === "PENDING").length;
  const pendingIssuesCount = issues.filter((i: any) => i.status === "PENDING" || i.status === "CHO_TIEP_NHAN" || i.status === "DANG_XU_LY").length;

  const data = {
    hasContract: !!activeContract,
    unpaidInvoicesCount,
    pendingIssuesCount,
    invoices,
    issues
  };

  const metrics = [
    { label: "Hợp đồng thuê", value: data.hasContract ? "1" : "0", sub: data.hasContract ? `Phòng ${activeContract.roomNumber}` : "Chưa có", icon: FileText, color: "text-blue-600", bg: "bg-blue-100", href: "/tenant/contract" }, 
    { label: "Hoá đơn chưa thu", value: data.unpaidInvoicesCount, sub: "Cần thanh toán", icon: Receipt, color: "text-rose-600", bg: "bg-rose-100", href: "/tenant/invoices" },
    { label: "Sự cố đang xử lý", value: data.pendingIssuesCount, sub: "Đang chờ giải quyết", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100", href: "/tenant/issues" }
  ];

  const isLoading = isLoadingContracts || isLoadingInvoices || isLoadingIssues;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

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
              Bạn đang ở: {" "}
              <span className="text-white font-bold border-b border-dashed border-white/40 pb-0.5 hover:border-white transition-colors">
                {activeContract ? `Phòng ${activeContract.roomNumber}` : "Chưa thuê phòng nào"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Link key={metric.label} href={metric.href} className="block group">
            <Card className="border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">{metric.label}</CardTitle>
                <div className={`p-2 rounded-xl ${metric.bg} group-hover:scale-110 transition-transform`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{metric.value}</p>
                <p className="text-xs text-slate-500 mt-1">{metric.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800">Hoá đơn gần đây</CardTitle>
            <Link href="/tenant/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.invoices.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500">Chưa có hoá đơn nào.</p>
                </div>
              ) : (
                data.invoices.slice(0, 3).map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inv.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{inv.invoiceTitle || `Hoá đơn tháng ${new Date(inv.dueDate).getMonth()+1}`}</p>
                        <p className="text-xs text-slate-500">{new Date(inv.createdAt || inv.dueDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{inv.totalAmount?.toLocaleString()}đ</p>
                      <p className={`text-xs font-medium ${inv.status === 'PAID' ? 'text-green-600' : 'text-rose-600'}`}>
                        {inv.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800">Sự cố gần đây</CardTitle>
            <Link href="/tenant/issues" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.issues.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500">Chưa có sự cố nào được báo cáo.</p>
                </div>
              ) : (
                data.issues.slice(0, 3).map((issue: any) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${issue.status === 'HOAN_THANH' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{issue.issueType}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-[200px]">{issue.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 mb-1">{new Date(issue.createdAt).toLocaleDateString('vi-VN')}</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${issue.status === 'HOAN_THANH' ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'}`}>
                        {issue.status === 'HOAN_THANH' ? 'Hoàn thành' : (issue.status === 'DANG_XU_LY' ? 'Đang xử lý' : 'Chờ tiếp nhận')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
