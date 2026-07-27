import Link from "next/link";
import { Building2, FileText, Home, ReceiptText, Wrench } from "lucide-react";
import type { UserRole } from "@/types/auth";

interface SidebarProps { role: UserRole }

const landlordLinks = [{ href: "/landlord/dashboard", label: "Tổng quan", icon: Home }, { href: "/landlord/rooms", label: "Quản lý phòng", icon: Building2 }, { href: "/landlord/contracts", label: "Hợp đồng", icon: FileText }, { href: "/landlord/invoices", label: "Hóa đơn", icon: ReceiptText }];
const tenantLinks = [{ href: "/tenant/dashboard", label: "Tổng quan", icon: Home }, { href: "/tenant/invoices", label: "Xem hóa đơn", icon: ReceiptText }, { href: "/tenant/issues", label: "Báo sự cố", icon: Wrench }];

export function DashboardSidebar({ role }: SidebarProps) {
  const links = role === "TENANT" ? tenantLinks : landlordLinks;
  return <aside className="border-b bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r"><div className="flex h-16 items-center gap-2 px-4 font-bold"><Building2 className="text-blue-600" />Nhà Trọ SaaS</div><nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:py-3">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Icon className="h-4 w-4" />{label}</Link>)}</nav></aside>;
}
