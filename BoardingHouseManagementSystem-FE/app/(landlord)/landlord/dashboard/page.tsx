import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { Users, DoorOpen, Receipt, FileWarning } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function fetchDashboardData() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken || "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  
  try {
    const [roomsRes, tenantsRes, invoicesRes, issuesRes] = await Promise.all([
      fetch(`${apiUrl}/api/rooms`, { headers, cache: "no-store" }),
      fetch(`${apiUrl}/api/tenants`, { headers, cache: "no-store" }),
      fetch(`${apiUrl}/api/invoices`, { headers, cache: "no-store" }),
      fetch(`${apiUrl}/api/issues`, { headers, cache: "no-store" })
    ]);

    const roomsResData = roomsRes.ok ? await roomsRes.json() : { data: [] };
    const tenantsResData = tenantsRes.ok ? await tenantsRes.json() : { data: [] };
    const invoicesResData = invoicesRes.ok ? await invoicesRes.json() : { data: [] };
    const issuesResData = issuesRes.ok ? await issuesRes.json() : { data: [] };

    const rooms = Array.isArray(roomsResData) ? roomsResData : (roomsResData.data || []);
    const tenants = Array.isArray(tenantsResData) ? tenantsResData : (tenantsResData.data || []);
    const invoices = Array.isArray(invoicesResData) ? invoicesResData : (invoicesResData.data || []);
    const issues = Array.isArray(issuesResData) ? issuesResData : (issuesResData.data || []);

    const rentedRoomsCount = rooms.filter((r: any) => r.status === "RENTED").length;
    const unpaidInvoicesCount = invoices.filter((i: any) => i.status === "UNPAID" || i.status === "PENDING").length;
    const pendingIssuesCount = issues.filter((i: any) => i.status === "PENDING" || i.status === "OPEN").length;

    return {
      rentedRoomsCount,
      tenantsCount: tenants.length,
      unpaidInvoicesCount,
      pendingIssuesCount,
      invoices
    };
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu dashboard:", error);
    return { rentedRoomsCount: 0, tenantsCount: 0, unpaidInvoicesCount: 0, pendingIssuesCount: 0, invoices: [] };
  }
}

export default async function LandlordDashboardPage() { 
  const data = await fetchDashboardData();

  const metrics = [
    { label: "Phòng đang thuê", value: data.rentedRoomsCount, icon: DoorOpen, color: "text-blue-600", bg: "bg-blue-100", href: "/landlord/rooms" }, 
    { label: "Khách thuê hiện tại", value: data.tenantsCount, icon: Users, color: "text-emerald-600", bg: "bg-emerald-100", href: "/landlord/tenants" }, 
    { label: "Hóa đơn chưa thu", value: data.unpaidInvoicesCount, icon: Receipt, color: "text-amber-600", bg: "bg-amber-100", href: "/landlord/invoices" },
    { label: "Sự cố cần xử lý", value: data.pendingIssuesCount, icon: FileWarning, color: "text-red-600", bg: "bg-red-100", href: "/landlord/issues" }
  ];

  return (
    <div className="p-2 sm:p-6 space-y-8">
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
              {[
                { time: "10 phút trước", event: "Nguyễn Văn A đã thanh toán hóa đơn #1234", type: "success" },
                { time: "1 giờ trước", event: "Phòng 102 báo cáo sự cố rò rỉ nước", type: "warning" },
                { time: "Hôm qua", event: "Khách thuê mới dọn vào phòng 205", type: "info" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'success' ? 'bg-emerald-500' : 
                    activity.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activity.event}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  ); 
}
