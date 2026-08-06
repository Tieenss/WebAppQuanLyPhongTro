"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, MoreVertical, FileText, CheckCircle2, ArrowLeft, Eye, Printer, Trash2, X } from "lucide-react";
import { CreateInvoiceModal } from "@/components/invoices/CreateInvoiceModal";
import { ViewInvoiceModal } from "@/components/invoices/ViewInvoiceModal";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import apiClient, { fetcher } from "@/lib/apiClient";
import useSWR, { useSWRConfig } from "swr";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function InvoicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: swrInvoices, isLoading: isLoadingInvoices } = useSWR('/invoices', fetcher);
  const { data: swrContracts, isLoading: isLoadingContracts } = useSWR('/contracts/active', fetcher);
  const { mutate } = useSWRConfig();
  
  const invoices = swrInvoices ? (Array.isArray(swrInvoices) ? swrInvoices : (swrInvoices.data || [])) : [];
  const contracts = swrContracts ? (Array.isArray(swrContracts) ? swrContracts : (swrContracts.data || [])) : [];
  const isLoading = isLoadingInvoices || isLoadingContracts;

  const handlePayInvoice = async (id: number) => {
    try {
      await apiClient.put(`/invoices/${id}/pay`, { paymentImageUrl: "" });
      toast.success("Đã xác nhận thu tiền thành công!");
      mutate('/invoices');
    } catch (error) {
      toast.error("Không thể xác nhận thu tiền.");
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này không? Hành động này không thể hoàn tác.")) {
      try {
        await apiClient.delete(`/invoices/${id}`);
        toast.success("Đã xóa hóa đơn thành công!");
        mutate('/invoices');
      } catch (error) {
        toast.error("Không thể xóa hóa đơn.");
      }
    }
  };

  const handleRejectInvoice = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn từ chối biên lai này? Người thuê sẽ phải nộp lại biên lai khác.")) {
      try {
        await apiClient.put(`/invoices/${id}/reject`, {});
        toast.success("Đã từ chối biên lai thành công!");
        mutate('/invoices');
      } catch (error) {
        toast.error("Không thể từ chối biên lai.");
      }
    }
  };

  const filteredInvoices = invoices.filter((inv: any) => 
    inv.invoiceCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Link href="/landlord/management" className="text-slate-400 hover:text-blue-600 transition-colors mt-1 sm:mt-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý hóa đơn</h1>
            <p className="mt-1 text-sm text-slate-500">Tạo mới, theo dõi và quản lý các khoản thu tiền phòng, điện nước.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>Lập hóa đơn mới</span>
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
              placeholder="Tìm theo mã hóa đơn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" />
            <span>Lọc trạng thái</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Mã Hóa đơn</th>
                <th className="px-6 py-4 whitespace-nowrap">Ngày lập</th>
                <th className="px-6 py-4 whitespace-nowrap">Hạn thanh toán</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Tổng tiền</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Trạng thái</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-slate-300 mb-4" />
                      <p className="text-lg font-medium text-slate-700">Chưa có hóa đơn nào</p>
                      <p className="text-sm mt-1">Hãy tạo hóa đơn đầu tiên bằng cách nhấn nút "Lập hóa đơn mới".</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                      {inv.invoiceCode || `#INV-${inv.id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inv.createdAt ? format(new Date(inv.createdAt), 'dd/MM/yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        new Date(inv.dueDate) < new Date() && inv.status !== "PAID" 
                          ? "bg-red-100 text-red-700" 
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {inv.dueDate ? format(new Date(inv.dueDate), 'dd/MM/yyyy') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(inv.totalAmount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {inv.status === "PAID" ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã thanh toán</span>
                        </span>
                      ) : inv.status === "PENDING" && inv.paymentImageUrl ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Chờ xác nhận
                        </span>
                      ) : inv.status === "UNPAID" || inv.status === "PENDING" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Chờ thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {inv.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.status !== "PAID" && (
                          <button 
                            onClick={() => handlePayInvoice(inv.id)}
                            className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                          >
                            Xác nhận thu
                          </button>
                        )}
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-blue-500">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content 
                              className="min-w-[180px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-1.5 z-[100] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
                              align="end"
                              sideOffset={4}
                            >
                              <DropdownMenu.Item 
                                onSelect={() => setViewInvoice(inv)}
                                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center outline-none cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2.5 text-slate-400" />
                                Xem chi tiết
                              </DropdownMenu.Item>
                              <DropdownMenu.Item 
                                onSelect={() => {
                                  setViewInvoice(inv);
                                  // Optional: setTimeout(() => window.print(), 500)
                                }}
                                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center outline-none cursor-pointer"
                              >
                                <Printer className="w-4 h-4 mr-2.5 text-slate-400" />
                                In / Xuất PDF
                              </DropdownMenu.Item>
                              {inv.status !== "PAID" && (
                                <DropdownMenu.Item 
                                  onSelect={() => handlePayInvoice(inv.id)}
                                  className="px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center outline-none cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2.5 text-emerald-500" />
                                  Xác nhận thu tiền
                                </DropdownMenu.Item>
                              )}
                              {inv.status === "PENDING" && inv.paymentImageUrl && (
                                <DropdownMenu.Item 
                                  onSelect={() => handleRejectInvoice(inv.id)}
                                  className="px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors flex items-center outline-none cursor-pointer"
                                >
                                  <X className="w-4 h-4 mr-2.5 text-amber-500" />
                                  Từ chối biên lai
                                </DropdownMenu.Item>
                              )}
                              <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                              <DropdownMenu.Item 
                                onSelect={() => handleDeleteInvoice(inv.id)}
                                className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center outline-none cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2.5 text-red-400" />
                                Xóa hóa đơn
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateInvoiceModal 
        isOpen={isModalOpen} 
        onOpenChange={(open) => setIsModalOpen(open)}
        contracts={contracts}
        onSuccess={() => mutate('/invoices')}
      />
      <ViewInvoiceModal 
        isOpen={!!viewInvoice} 
        onOpenChange={(open) => !open && setViewInvoice(null)} 
        invoice={viewInvoice}
      />
    </div>
  );
}
