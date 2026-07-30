"use client";

import React, { useState, useEffect, useRef } from "react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { ArrowLeft, Search, Plus, Upload, X, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Issue {
  id: number;
  roomId: number;
  roomNumber: string;
  tenantId: number;
  tenantName: string;
  issueType: string;
  description: string;
  imageUrl: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt: string;
}

interface ActiveContract {
  id: number;
  roomId: number;
  roomNumber: string;
  status: string;
}

export default function TenantIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeContract, setActiveContract] = useState<ActiveContract | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [issueType, setIssueType] = useState("ĐIỆN");
  const [priority, setPriority] = useState("TRUNG_BINH");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchIssuesAndContract = async () => {
    setIsLoading(true);
    try {
      // Get issues
      const resIssues = await apiClient.get("/su-co");
      setIssues(resIssues.data);

      // Get active contract to know the room
      const resContracts = await apiClient.get("/contracts");
      const contracts = resContracts.data;
      const active = contracts.find((c: any) => c.status === "DANG_THUE" || c.status === "ACTIVE");
      if (active) {
        setActiveContract(active);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách sự cố.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuesAndContract();
  }, []);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContract) {
      toast.error("Bạn chưa có hợp đồng thuê phòng nào đang hoạt động.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = "";

      // 1. Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await apiClient.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      // 2. Submit issue
      await apiClient.post("/su-co", {
        roomId: activeContract.roomId,
        issueType,
        priority,
        description,
        imageUrl
      });

      toast.success("Đã gửi báo cáo sự cố thành công!");
      setIsModalOpen(false);
      resetForm();
      fetchIssuesAndContract();
    } catch (error) {
      toast.error("Không thể gửi báo cáo sự cố.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIssueType("ĐIỆN");
    setPriority("TRUNG_BINH");
    setDescription("");
    removeImage();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CHO_TIEP_NHAN":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Chờ tiếp nhận</span>;
      case "DANG_XU_LY":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Đang xử lý</span>;
      case "HOAN_THANH":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Hoàn thành</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "CAO":
      case "KHAN_CAP":
        return <span className="text-red-600 font-medium">Cao</span>;
      case "TRUNG_BINH":
        return <span className="text-orange-600 font-medium">Trung bình</span>;
      case "THAP":
        return <span className="text-slate-600 font-medium">Thấp</span>;
      default:
        return <span>{priority}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Link href="/tenant/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors mt-1 sm:mt-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Báo Cáo Sự Cố</h1>
            <p className="mt-1 text-sm text-slate-500">Gửi báo cáo sửa chữa, hỏng hóc trong phòng của bạn.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Báo cáo sự cố mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phòng</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Chi tiết sự cố</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mức độ</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày báo cáo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Bạn chưa gửi báo cáo sự cố nào.</td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      Phòng {issue.roomNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{issue.issueType}</div>
                      <div className="text-sm text-slate-500 truncate max-w-xs">{issue.description}</div>
                      {issue.imageUrl && (
                        <a href={issue.imageUrl} target="_blank" rel="noreferrer" className="text-blue-500 text-xs flex items-center mt-1 hover:underline">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Xem ảnh đính kèm
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getPriorityBadge(issue.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(issue.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(issue.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Báo cáo sự cố mới</h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {!activeContract && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 mb-4">
                  Bạn hiện không có hợp đồng thuê phòng nào đang hoạt động, không thể báo cáo sự cố.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại sự cố</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="ĐIỆN">Sự cố về Điện</option>
                  <option value="NƯỚC">Sự cố về Nước</option>
                  <option value="NỘI_THẤT">Hỏng hóc Nội thất</option>
                  <option value="AN_NINH">Vấn đề An ninh</option>
                  <option value="KHÁC">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mức độ ưu tiên</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="THAP">Thấp (Có thể chờ vài ngày)</option>
                  <option value="TRUNG_BINH">Trung bình (Cần sửa trong 1-2 ngày)</option>
                  <option value="CAO">Cao (Cần sửa ngay trong ngày)</option>
                  <option value="KHAN_CAP">Khẩn cấp (Nguy hiểm, cần xử lý ngay lập tức)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="Mô tả chi tiết về sự cố đang xảy ra..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh đính kèm (Tùy chọn)</label>
                
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={removeImage}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Nhấn để tải ảnh lên</span>
                    <span className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG (Tối đa 10MB)</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 mt-6 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!activeContract || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Đang gửi...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Gửi báo cáo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
