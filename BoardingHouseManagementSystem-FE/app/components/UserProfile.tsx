"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { User, Phone, Mail, Building2, CreditCard, Building, ShieldCheck, Camera, Save, Loader2, KeyRound } from "lucide-react";
import Image from "next/image";

interface ProfileData {
  id?: number;
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  avatarUrl?: string;
  businessName?: string;
  taxCode?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  cccdNumber?: string;
  cccdFrontImg?: string;
  cccdBackImg?: string;
}

export default function UserProfile() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/profile/me");
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.info("Đang tải ảnh lên...");
      const res = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(prev => ({ ...prev, [fieldName]: res.data.fileUrl }));
      toast.success("Tải ảnh thành công");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Tải ảnh thất bại");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiClient.put("/profile/me", profile);
      setProfile(res.data);
      // Update session if needed
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profile.fullName,
          email: profile.email
        }
      });
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Cập nhật thông tin thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.put("/profile/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Đổi mật khẩu thành công!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast.error(error.response?.data || "Đổi mật khẩu thất bại");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const role = session?.user?.role || profile.role;
  const isLandlord = role === "LANDLORD";
  const isTenant = role === "TENANT" || role === "GUEST";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative w-24 h-24 rounded-full border-4 border-white bg-slate-100 overflow-hidden flex items-center justify-center group cursor-pointer">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => handleFileChange(e, "avatarUrl")}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{profile.fullName || profile.username || "Chưa cập nhật tên"}</h1>
              <p className="text-slate-500">{role === "ADMIN" ? "Quản trị viên" : isLandlord ? "Chủ trọ" : "Khách thuê"}</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>Lưu thay đổi</span>
            </button>
          </div>

          <div className="space-y-8">
            {/* Common Info */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                <User className="w-5 h-5 text-blue-500" />
                Thông tin chung
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên hiển thị</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName || ""}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={profile.username || ""}
                    disabled
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profile.email || ""}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone || ""}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Landlord Specific Info */}
            {isLandlord && (
              <>
                <section>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                    Thông tin Kinh doanh
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tên Doanh nghiệp / Hộ KD</label>
                      <input
                        type="text"
                        name="businessName"
                        value={profile.businessName || ""}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mã số thuế (Tùy chọn)</label>
                      <input
                        type="text"
                        name="taxCode"
                        value={profile.taxCode || ""}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-50"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    Thông tin Thanh toán (Ngân hàng)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tên Ngân hàng</label>
                      <input
                        type="text"
                        name="bankName"
                        value={profile.bankName || ""}
                        onChange={handleInputChange}
                        placeholder="VD: Vietcombank, Techcombank..."
                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={profile.bankAccountNumber || ""}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chủ tài khoản</label>
                      <input
                        type="text"
                        name="bankAccountHolder"
                        value={profile.bankAccountHolder || ""}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50 uppercase"
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Tenant Specific Info */}
            {isTenant && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <ShieldCheck className="w-5 h-5 text-orange-500" />
                  Xác minh Danh tính (CCCD)
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số Căn cước công dân</label>
                    <input
                      type="text"
                      name="cccdNumber"
                      value={profile.cccdNumber || ""}
                      onChange={handleInputChange}
                      className="block w-full md:w-1/2 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-slate-50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh mặt trước CCCD</label>
                      <div className="relative w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center group overflow-hidden hover:border-orange-400 transition-colors">
                        {profile.cccdFrontImg ? (
                          <>
                            <Image src={profile.cccdFrontImg} alt="CCCD Front" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                              <span className="text-white font-medium flex items-center gap-2"><Camera className="w-5 h-5" /> Đổi ảnh khác</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-400 flex flex-col items-center">
                            <Camera className="w-8 h-8 mb-2 opacity-50 group-hover:text-orange-500 group-hover:opacity-100 transition-colors" />
                            <span className="text-sm">Bấm để tải ảnh lên</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          onChange={(e) => handleFileChange(e, "cccdFrontImg")}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh mặt sau CCCD</label>
                      <div className="relative w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center group overflow-hidden hover:border-orange-400 transition-colors">
                        {profile.cccdBackImg ? (
                          <>
                            <Image src={profile.cccdBackImg} alt="CCCD Back" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                              <span className="text-white font-medium flex items-center gap-2"><Camera className="w-5 h-5" /> Đổi ảnh khác</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-400 flex flex-col items-center">
                            <Camera className="w-8 h-8 mb-2 opacity-50 group-hover:text-orange-500 group-hover:opacity-100 transition-colors" />
                            <span className="text-sm">Bấm để tải ảnh lên</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          onChange={(e) => handleFileChange(e, "cccdBackImg")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </form>
      </div>
      
      {/* Change Password Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <form onSubmit={handlePasswordSubmit} className="p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
            <KeyRound className="w-5 h-5 text-red-500" />
            Đổi mật khẩu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                required
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-slate-50"
              />
            </div>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-slate-50"
              />
            </div>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-slate-50"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isChangingPassword || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
              <span>Đổi mật khẩu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
