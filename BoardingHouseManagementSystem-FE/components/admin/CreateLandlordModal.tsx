"use client";

import { useState } from "react";
import apiClient from "@/lib/apiClient";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateLandlordModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiClient.post("/users", {
        ...formData,
        role: "landlord", // Force role to landlord
      });
      onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tạo chủ trọ";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Thêm Chủ Trọ Mới</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên *</label>
              <input
                required
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập *</label>
              <input
                required
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="nguyenvana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu *</label>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="******"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SĐT *</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="0912345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Tạo Chủ Trọ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
