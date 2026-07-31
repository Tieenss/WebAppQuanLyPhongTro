"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { Users, DoorOpen, Receipt, FileWarning, Loader2 } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/apiClient";

export default function LandlordDashboardPage() { 
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

  const rentedRoomsCount = rooms.filter((r: any) => r.status === "RENTED").length;
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
    { label: "Phòng đang thuê", value: data.rentedRoomsCount, icon: DoorOpen, color: "text-blue-600", bg: "bg-blue-100", href: "/landlord/room" }, 
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

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan</h1>
        <p className="mt-2 text-slate-500">Theo dõi hoạt động kinh doanh nhà trọ của bạn trong tháng này.</p>
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
