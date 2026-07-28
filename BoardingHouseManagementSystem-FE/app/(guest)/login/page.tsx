import { LoginForm } from "@/components/auth/login-form";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() { 
  return (
    <div className="w-full min-h-[calc(100vh-2rem)] flex rounded-3xl overflow-hidden shadow-2xl bg-white m-4">
      {/* Cột trái: Hình ảnh (Ẩn trên điện thoại) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Vòng tròn trang trí */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <Link href="/" className="relative z-10 flex items-center space-x-3 text-white hover:text-blue-100 transition-colors w-fit cursor-pointer">
          <Building2 size={36} />
          <span className="text-2xl font-bold tracking-tight">Nhà Trọ SaaS</span>
        </Link>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Quản lý nhà trọ <br />
            <span className="text-blue-200">chưa bao giờ dễ dàng đến thế.</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Hệ thống quản lý thông minh, tối ưu hóa quy trình, tính toán điện nước tự động và theo dõi doanh thu chi tiết.
          </p>
        </div>
        
        <div className="relative z-10 text-blue-200 text-sm">
          © {new Date().getFullYear()} Nhà Trọ SaaS. All rights reserved.
        </div>
      </div>

      {/* Cột phải: Biểu mẫu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-sky-50 lg:bg-white relative">
        <LoginForm />
      </div>
    </div>
  ); 
}
