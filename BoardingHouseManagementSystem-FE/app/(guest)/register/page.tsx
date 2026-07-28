import { RegisterForm } from "@/components/auth/register-form";
import { Building2 } from "lucide-react";

export default function RegisterPage() { 
  return (
    <div className="w-full min-h-[calc(100vh-2rem)] flex rounded-3xl overflow-hidden shadow-2xl bg-white m-4">
      {/* Cột trái: Biểu mẫu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-sky-50 lg:bg-white relative">
        <RegisterForm />
      </div>

      {/* Cột phải: Hình ảnh (Ẩn trên điện thoại) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-800 to-blue-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Vòng tròn trang trí */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center justify-end space-x-3 text-white">
          <span className="text-2xl font-bold tracking-tight">Nhà Trọ SaaS</span>
          <Building2 size={36} />
        </div>
        
        <div className="relative z-10 space-y-6 text-right">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Tham gia cùng <br />
            <span className="text-blue-200">hàng ngàn chủ trọ khác.</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-md ml-auto">
            Hệ sinh thái số 1 giúp tự động hóa khâu tính tiền, hóa đơn, và báo cáo sự cố cho cả người cho thuê và người đi thuê.
          </p>
        </div>
        
        <div className="relative z-10 text-blue-200 text-sm text-right">
          © {new Date().getFullYear()} Nhà Trọ SaaS. All rights reserved.
        </div>
      </div>
    </div>
  ); 
}
