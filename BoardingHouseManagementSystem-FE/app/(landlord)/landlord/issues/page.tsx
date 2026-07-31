"use client";

import React, { useState } from "react";
import apiClient, { fetcher } from "@/lib/apiClient";
import { toast } from "sonner";
import { ArrowLeft, Search, CheckCircle, Edit, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import useSWR, { useSWRConfig } from "swr";

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

export default function LandlordIssuesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [statusInput, setStatusInput] = useState("");

  const { data: swrIssues, isLoading } = useSWR('/su-co', fetcher);
  const { mutate } = useSWRConfig();
  
  const issues = Array.isArray(swrIssues) ? swrIssues : (swrIssues?.data || []);

  const handleOpenEdit = (issue: Issue) => {
    setSelectedIssue(issue);
    setStatusInput(issue.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    try {
      await apiClient.put(`/su-co/${selectedIssue.id}`, {
        status: statusInput
      });
      toast.success("Cập nhật trạng thái thành công!");
      setIsModalOpen(false);
      mutate('/su-co');
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái sự cố.");
    }
  };

  const filteredIssues = issues.filter(
    (issue) =>
      issue.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issueType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Link href="/landlord/management" className="text-slate-400 hover:text-blue-600 transition-colors mt-1 sm:mt-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý Sự cố</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi và cập nhật trạng thái các yêu cầu sửa chữa, sự cố từ người thuê.</p>
          </div>
        </div>
        <button
          onClick={fetchIssues}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo phòng, người báo, loại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-10 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phòng / Người báo</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Chi tiết sự cố</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mức độ</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày báo cáo</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">Không tìm thấy sự cố nào.</td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">Phòng {issue.roomNumber}</div>
                      <div className="text-sm text-slate-500">{issue.tenantName || 'Không xác định'}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEdit(issue)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-flex items-center"
                        title="Cập nhật trạng thái"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Cập nhật sự cố phòng {selectedIssue.roomNumber}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại sự cố</label>
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-200">
                  <span className="font-semibold">{selectedIssue.issueType}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-200 h-24 overflow-y-auto">
                  {selectedIssue.description}
                </div>
              </div>

              {selectedIssue.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh đính kèm</label>
                  <img src={selectedIssue.imageUrl} alt="Sự cố" className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái mới</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="CHO_TIEP_NHAN">Chờ tiếp nhận</option>
                  <option value="DANG_XU_LY">Đang xử lý</option>
                  <option value="HOAN_THANH">Hoàn thành</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Cập nhật</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
