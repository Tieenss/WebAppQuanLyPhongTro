"use client";

import { useState, useEffect, useRef } from "react";
import apiClient from "@/lib/apiClient";
import { Plus, Trash2, ShieldAlert, Edit, Upload, X, User as UserIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    phone: "",
    email: "",
    role: "TENANT",
    avatarUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/users");
      setUsers(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await apiClient.delete(`/users/${id}`);
      toast.success("Đã xóa người dùng");
      fetchUsers();
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const handleEdit = (user: UserResponse) => {
    setEditUserId(user.id);
    setFormData({
      username: user.username,
      password: "", // Leave blank so we only update if provided
      fullName: user.fullName,
      phone: user.phone || "",
      email: user.email || "",
      role: user.role,
      avatarUrl: user.avatarUrl || "",
    });
    setImageFile(null);
    setImagePreview(user.avatarUrl || null);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditUserId(null);
    setFormData({ username: "", password: "", fullName: "", phone: "", email: "", role: "TENANT", avatarUrl: "" });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, avatarUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalAvatarUrl = formData.avatarUrl;

      // Upload image if a new one is selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        const uploadRes = await apiClient.post("/upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        finalAvatarUrl = uploadRes.data.imageUrl;
      }

      const payload = { ...formData, avatarUrl: finalAvatarUrl };

      if (editUserId) {
        await apiClient.put(`/users/${editUserId}`, payload);
        toast.success("Cập nhật thông tin thành công");
      } else {
        await apiClient.post("/users", payload);
        toast.success("Tạo tài khoản thành công");
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(editUserId ? "Cập nhật thất bại" : "Tạo tài khoản thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Quản lý Tài khoản</h2>
            <p className="text-slate-500 mt-1">Xem và quản lý tất cả Chủ trọ và Khách thuê</p>
          </div>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo tài khoản
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Người dùng</th>
                <th className="p-4 font-semibold">SĐT / Username</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Vai trò</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-8 text-slate-500">Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-8 text-slate-500">Không có dữ liệu</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-mono text-sm text-slate-500">#{user.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-300">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{user.phone || "-"}</div>
                      <div className="text-xs text-slate-400">@{user.username}</div>
                    </td>
                    <td className="p-4 text-slate-600">{user.email || "-"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'LANDLORD' ? 'bg-orange-100 text-orange-700' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa thông tin"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  {editUserId ? "Sửa tài khoản" : "Tạo tài khoản mới"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden group">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={removeImage} className="text-white hover:text-red-400">
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:text-indigo-500 w-full h-full"
                      >
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Tải ảnh</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:bg-slate-100"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  disabled={!!editUserId} // Cannot change role while editing (for safety)
                >
                  <option value="TENANT">Khách thuê (TENANT)</option>
                  <option value="LANDLORD">Chủ trọ (LANDLORD)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:bg-slate-100"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    disabled={!!editUserId} // Prevent username change
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mật khẩu {editUserId && <span className="text-slate-400 font-normal">(Bỏ trống nếu không đổi)</span>}
                  </label>
                  <input 
                    required={!editUserId}
                    type="password" 
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder={editUserId ? "******" : ""}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? "Đang xử lý..." : editUserId ? "Lưu thay đổi" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
