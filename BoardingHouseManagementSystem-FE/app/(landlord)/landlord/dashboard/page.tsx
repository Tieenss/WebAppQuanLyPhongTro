"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { Users, DoorOpen, Receipt, FileWarning, Loader2 } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/apiClient";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export default function LandlordDashboardPage() { 
  const { data: session } = useSession();
  const userName = session?.user?.name || (session?.user as any)?.fullName || (session?.user as any)?.username || "bạn";
  const userRole = session?.user?.role === "LANDLORD" ? "Chủ trọ" : session?.user?.role === "ADMIN" ? "Quản trị viên" : "Người dùng";

  const { data: buildingsRes } = useSWR("/buildings", fetcher);
  const managedBuildings = buildingsRes || [];
  const displayedBuildings = useMemo(() => {
    if (managedBuildings.length === 0) return "Chưa có nhà trọ nào";
    const names = managedBuildings.map((b: any) => b.name);
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} và ${names.length - 2} nhà trọ khác`;
  }, [managedBuildings]);

  const { data: roomsRes, isLoading: isLoadingRooms } = useSWR("/rooms", fetcher);
  const { data: tenantsRes, isLoading: isLoadingTenants } = useSWR("/tenants", fetcher);
  const { data: invoicesRes, isLoading: isLoadingInvoices } = useSWR("/invoices", fetcher);
  const { data: issuesRes, isLoading: isLoadingIssues } = useSWR("/su-co", fetcher);
  const { data: activitiesRes, isLoading: isLoadingActivities } = useSWR("/activities/recent?limit=5", fetcher);

  const rooms = roomsRes || [];
  const tenants = tenantsRes || [];
  const invoices = invoicesRes || [];
  const issues = issuesRes || [];
  const activities = activitiesRes || [];

  const rentedRoomsCount = rooms.filter((r: any) => r.status?.toLowerCase() === "rented" || r.status?.toLowerCase() === "dang_thue").length;
  const unpaidInvoicesCount = invoices.filter((i: any) => i.status === "UNPAID" || i.status === "PENDING").length;
  const pendingIssuesCount = issues.filter((i: any) => i.status === "PENDING" || i.status === "OPEN").length;

  const data = {
    rentedRoomsCount,
    tenantsCount: tenants.length,
    unpaidInvoicesCount,
    pendingIssuesCount,
    invoices,
    activities
  };

  const metrics = [
    { label: "Phòng đang thuê", value: `${data.rentedRoomsCount}/${rooms.length}`, icon: DoorOpen, color: "text-blue-600", bg: "bg-blue-100", href: "/landlord/room" }, 
    { label: "Khách thuê hiện tại", value: data.tenantsCount, icon: Users, color: "text-emerald-600", bg: "bg-emerald-100", href: "/landlord/tenants" }, 
    { label: "Hóa đơn chưa thu", value: data.unpaidInvoicesCount, icon: Receipt, color: "text-amber-600", bg: "bg-amber-100", href: "/landlord/invoices" },
    { label: "Sự cố cần xử lý", value: data.pendingIssuesCount, icon: FileWarning, color: "text-red-600", bg: "bg-red-100", href: "/landlord/issues" }
  ];

  const isLoading = isLoadingRooms || isLoadingTenants || isLoadingInvoices || isLoadingIssues || isLoadingActivities;

  return (
    <div className="p-2 sm:p-6 space-y-8 relative">
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

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Doanh thu 6 tháng gần nhất</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart invoices={data.invoices} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.activities.length === 0 ? (
                 <p className="text-sm text-slate-500 italic">Chưa có hoạt động nào được ghi nhận.</p>
              ) : (
                data.activities.map((activity: any, i: number) => {
                  let colorClass = 'bg-blue-500';
                  if (activity.actionType === 'CREATE') colorClass = 'bg-emerald-500';
                  else if (activity.actionType === 'DELETE') colorClass = 'bg-red-500';
                  
                  // Simple formatting for time
                  const date = new Date(activity.createdAt);
                  const timeString = date.toLocaleDateString('vi-VN') + " " + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

                  return (
                    <div key={activity.id || i} className="flex items-start gap-4">
                      <div className={`w-2 h-2 mt-2 rounded-full ${colorClass}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{timeString}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  ); 
}
