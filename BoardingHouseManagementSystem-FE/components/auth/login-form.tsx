"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";

const loginSchema = z.object({ 
  identifier: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập, email hoặc SĐT"), 
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự") 
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginValues>({ 
    resolver: zodResolver(loginSchema), 
    defaultValues: { identifier: "", password: "" } 
  });

  async function onSubmit(values: LoginValues) {
    const result = await signIn("credentials", { ...values, redirect: false });
    if (result?.error) { 
      toast.error("Tài khoản hoặc mật khẩu không đúng."); 
      return; 
    }
    toast.success("Đăng nhập thành công.");
    
    // Get session to determine role and redirect accordingly
    const session = await getSession();
    const userRole = session?.user?.role?.toUpperCase();
    if (userRole === "LANDLORD") {
      router.replace("/landlord/dashboard");
    } else if (userRole === "ADMIN") {
      router.replace("/admin/dashboard");
    } else if (userRole === "TENANT") {
      router.replace("/tenant/dashboard");
    } else {
      router.replace("/");
    }
    
    router.refresh();
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col">
      <div className="mb-8 space-y-2 lg:text-left text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          Đăng Nhập
        </h2>
        <p className="text-slate-500 font-medium">
          Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
        </p>
      </div>

      <div className="w-full bg-white lg:bg-transparent lg:p-0 rounded-[2rem] shadow-xl lg:shadow-none p-8">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Identifier Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User size={20} />
            </div>
            <input
              id="identifier"
              autoComplete="username"
              placeholder="Tên đăng nhập, email hoặc SĐT"
              className={`w-full pl-11 pr-4 py-4 bg-slate-50/80 border ${
                form.formState.errors.identifier ? "border-red-400" : "border-slate-200"
              } rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all text-sm`}
              {...form.register("identifier")}
            />
            {form.formState.errors.identifier && (
              <p className="text-xs text-red-500 mt-1 pl-2">{form.formState.errors.identifier.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={20} />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Mật khẩu"
              className={`w-full pl-11 pr-12 py-4 bg-slate-50/80 border ${
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

          {/* Options */}
          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
              <span className="text-slate-600 font-medium">Ghi nhớ đăng nhập</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="group w-full flex items-center justify-center space-x-2 bg-primary hover:bg-blue-700 text-white font-semibold py-4 rounded-full transition-all shadow-lg shadow-blue-500/30"
            >
              {form.formState.isSubmitting ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span className="text-base tracking-wide">Đăng nhập</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Bạn chưa có tài khoản?{" "}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
