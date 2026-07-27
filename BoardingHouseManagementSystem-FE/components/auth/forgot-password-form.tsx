"use client";

import { useState } from "react";
import { LoaderCircle, User, Lock, ArrowRight, ShieldCheck, Mail, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export function ForgotPasswordForm() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error("Vui lòng nhập Tên đăng nhập, SĐT hoặc Email.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data || "Tài khoản không tồn tại.");
        setIsLoading(false);
        return;
      }
      
      // The backend returns { message, mockOtp }
      toast.success(data.message);
      
      // Display the mock OTP in a toast for the user to copy since we don't send real emails
      toast("Mã xác thực của bạn là: " + data.mockOtp, {
        duration: 10000,
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(data.mockOtp)
        },
      });
      
      setStep(2);
    } catch (error) {
      toast.error("Có lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error("Vui lòng nhập đầy đủ mã OTP và mật khẩu mới.");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải từ 6 ký tự trở lên.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, newPassword }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        toast.error(errorText || "Mã xác nhận không đúng hoặc đã hết hạn.");
        setIsLoading(false);
        return;
      }
      
      toast.success("Mật khẩu đã được thay đổi thành công!");
      router.push("/login");
    } catch (error) {
      toast.error("Có lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col">
      <div className="mb-8 space-y-2 lg:text-left text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Quên mật khẩu?
        </h2>
        <p className="text-slate-500 font-medium">
          {step === 1 ? "Đừng lo, hãy nhập thông tin để chúng tôi gửi mã xác nhận." : "Mã xác nhận đã được gửi. Vui lòng kiểm tra và tạo mật khẩu mới."}
        </p>
      </div>

      <div className="w-full bg-white lg:bg-transparent lg:p-0 rounded-[2rem] shadow-xl lg:shadow-none p-8">
        {step === 1 ? (
          <form className="space-y-5" onSubmit={handleSendOtp}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User size={20} />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Tên đăng nhập, SĐT hoặc Email"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex items-center justify-center space-x-2 bg-primary hover:bg-blue-700 text-white font-semibold py-4 rounded-full transition-all shadow-lg shadow-blue-500/30"
              >
                {isLoading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-base tracking-wide">Gửi mã xác nhận</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleResetPassword}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <ShieldCheck size={20} />
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP 6 số"
                maxLength={6}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all text-sm tracking-widest font-mono"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-full transition-all shadow-lg shadow-emerald-500/30"
              >
                {isLoading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="text-base tracking-wide">Đặt lại mật khẩu</span>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-center space-x-2 text-slate-500 font-medium py-3 rounded-full hover:bg-slate-50 transition-all"
              >
                Quay lại
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Nhớ mật khẩu rồi?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
