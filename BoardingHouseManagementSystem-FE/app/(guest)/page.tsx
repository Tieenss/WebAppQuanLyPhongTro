import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24"><div className="mx-auto max-w-3xl text-center"><p className="mb-3 font-medium text-blue-600">Tìm nơi ở phù hợp với bạn</p><h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Tìm phòng trọ nhanh, sống an tâm hơn</h1><p className="mt-5 text-lg text-slate-600">Khám phá phòng trọ rõ ràng thông tin và quản lý mọi dịch vụ trong một nơi.</p></div><form className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-xl border bg-white p-3 shadow-sm sm:flex-row"><div className="relative flex-1"><MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input aria-label="Khu vực tìm kiếm" className="pl-9" placeholder="Nhập khu vực, quận hoặc thành phố" /></div><Button type="submit"><Search className="h-4 w-4" />Tìm phòng</Button></form><div className="mt-12 text-center"><Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">Đăng nhập để quản lý phòng trọ</Link></div></section>;
}
