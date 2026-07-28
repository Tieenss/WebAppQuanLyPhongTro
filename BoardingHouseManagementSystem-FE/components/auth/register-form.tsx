"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, User, Lock, Phone, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";

const registerSchema = z.object({ 
  fullName: z.string().trim().min(2, "Vui lòng nhập họ và tên hợp lệ"),
  username: z.string().trim().min(4, "Tên đăng nhập tối thiểu 4 ký tự"),
  phone: z.string().trim().min(10, "Số điện thoại không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  confirmPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  role: z.enum(["LANDLORD", "TENANT"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});
type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<RegisterValues>({ 
    resolver: zodResolver(registerSchema), 
    defaultValues: { fullName: "", username: "", phone: "", password: "", confirmPassword: "", role: "LANDLORD" } 
  });
  
  const [isRegistering, setIsRegistering] = useState(false);

  async function onSubmit(values: RegisterValues) {
    setIsRegistering(true);
    try {
      // Call backend API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorText = await res.text();
        toast.error(errorText || "Đăng ký thất bại. Vui lòng thử lại.");
        setIsRegistering(false);
        return;
      }

      // Auto login after register
      const result = await signIn("credentials", { 
        identifier: values.username, 
        password: values.password, 
        redirect: false 
      });

      if (result?.error) { 
        toast.error("Tạo tài khoản thành công nhưng tự động đăng nhập thất bại."); 
        router.push("/login");
        return; 
      }
      
      toast.success("Tạo tài khoản thành công!");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error("Có lỗi xảy ra, không thể kết nối tới server.");
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col">
      <div className="mb-8 space-y-2 lg:text-left text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Tạo Tài Khoản
        </h2>
        <p className="text-slate-500 font-medium">
          Điền thông tin bên dưới để trải nghiệm Nhà Trọ SaaS.
        </p>
      </div>

      <div className="w-full bg-white lg:bg-transparent lg:p-0 rounded-[2rem] shadow-xl lg:shadow-none p-8">
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          
          {/* Lựa chọn Vai trò */}
          <div className="grid grid-cols-2 gap-4 pb-2">
            <label className={`cursor-pointer flex items-center justify-center space-x-2 py-3 rounded-2xl border-2 transition-all ${
              form.watch("role") === "LANDLORD" ? "border-primary bg-sky-50 text-primary" : "border-slate-100 text-slate-500 hover:bg-slate-50"
            }`}>
              <input type="radio" value="LANDLORD" className="hidden" {...form.register("role")} />
              <ShieldCheck size={18} />
              <span className="font-semibold text-sm">Chủ trọ</span>
            </label>
            <label className={`cursor-pointer flex items-center justify-center space-x-2 py-3 rounded-2xl border-2 transition-all ${
              form.watch("role") === "TENANT" ? "border-primary bg-sky-50 text-primary" : "border-slate-100 text-slate-500 hover:bg-slate-50"
            }`}>
              <input type="radio" value="TENANT" className="hidden" {...form.register("role")} />
              <User size={18} />
              <span className="font-semibold text-sm">Khách thuê</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Nhập Họ và tên */}
            <div className="relative col-span-2">
              <input
                id="fullName"
                placeholder="Họ và tên"
                className={`w-full px-4 py-3.5 bg-slate-50/80 border ${
                  form.formState.errors.fullName ? "border-red-400" : "border-slate-200"
                } rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all text-sm`}
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName && (
                <p className="text-xs text-red-500 mt-1 pl-2">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            {/* Nhập Tên đăng nhập */}
            <div className="relative col-span-1">
              <input
                id="username"
                autoComplete="username"
                placeholder="Tên đăng nhập"
                className={`w-full px-4 py-3.5 bg-slate-50/80 border ${
                  form.formState.errors.username ? "border-red-400" : "border-slate-200"
                } rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all text-sm`}
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-xs text-red-500 mt-1 pl-2">{form.formState.errors.username.message}</p>
              )}
            </div>

            {/* Nhập Số điện thoại */}
            <div className="relative col-span-1">
              <input
                id="phone"
                placeholder="Số điện thoại"
                className={`w-full px-4 py-3.5 bg-slate-50/80 border ${
                  form.formState.errors.phone ? "border-red-400" : "border-slate-200"
                } rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all text-sm`}
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-red-500 mt-1 pl-2">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Nhập Mật khẩu */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={20} />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mật khẩu"
              className={`w-full pl-11 pr-12 py-3.5 bg-slate-50/80 border ${
                form.formState.errors.password ? "border-red-400" : "border-slate-200"
              } rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all text-sm`}
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {form.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1 pl-2">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Nhập lại Mật khẩu */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={20} />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Xác nhận mật khẩu"
              className={`w-full pl-11 pr-12 py-3.5 bg-slate-50/80 border ${
                form.formState.errors.confirmPassword ? "border-red-400" : "border-slate-200"
              } rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all text-sm`}
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 pl-2">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Nút đăng ký */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isRegistering}
              className="group w-full flex items-center justify-center space-x-2 bg-primary hover:bg-blue-700 text-white font-semibold py-4 rounded-full transition-all shadow-lg shadow-blue-500/30"
            >
              {isRegistering ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span className="text-base tracking-wide">Đăng ký ngay</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Bạn đã có tài khoản?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
