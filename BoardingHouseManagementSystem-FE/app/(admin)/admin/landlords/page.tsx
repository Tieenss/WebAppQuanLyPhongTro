"use client";

import { useState, useEffect } from "react";
import { CreateLandlordModal } from "@/components/admin/CreateLandlordModal";
import apiClient from "@/lib/apiClient";

interface Landlord {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  createdAt: string;
}

export default function ManageLandlordsPage() {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLandlords = async () => {
    try {
      const res = await apiClient.get("/users/role/landlord");
      setLandlords(res.data);
    } catch (error) {
      console.error("Failed to fetch landlords", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlords();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chủ trọ này?")) return;
    
    try {
      await apiClient.delete(`/users/${id}`);
      fetchLandlords();
    } catch (error) {
      console.error("Failed to delete landlord", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Quản lý Chủ trọ</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          + Thêm Chủ Trọ
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Họ tên</th>
                <th className="p-4 font-medium">Username/SĐT</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Ngày tạo</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {landlords.map((landlord) => (
                <tr key={landlord.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-700">{landlord.id}</td>
                  <td className="p-4 font-medium text-slate-900">{landlord.fullName}</td>
                  <td className="p-4 text-slate-600">{landlord.username}</td>
                  <td className="p-4 text-slate-600">{landlord.email}</td>
                  <td className="p-4 text-slate-600">
                    {new Date(landlord.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(landlord.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Khóa / Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {landlords.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Chưa có tài khoản chủ trọ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <CreateLandlordModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchLandlords();
          }}
        />
      )}
    </div>
  );
}
