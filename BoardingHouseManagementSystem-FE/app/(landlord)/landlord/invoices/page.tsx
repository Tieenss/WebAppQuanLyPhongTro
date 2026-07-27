"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, MoreVertical, FileText, CheckCircle2 } from "lucide-react";
import { CreateInvoiceModal } from "@/components/invoices/CreateInvoiceModal";
import { format } from "date-fns";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('next-auth.session-token='))?.split('=')[1] || "";
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const [invRes, roomsRes] = await Promise.all([
        fetch(`${apiUrl}/api/invoices`, { headers }),
        fetch(`${apiUrl}/api/rooms`, { headers })
      ]);

      const [invResData, roomsResData] = await Promise.all([
        invRes.ok ? invRes.json() : { data: [] },
        roomsRes.ok ? roomsRes.json() : { data: [] }
      ]);

      const invData = Array.isArray(invResData) ? invResData : (invResData.data || []);
      const roomsData = Array.isArray(roomsResData) ? roomsResData : (roomsResData.data || []);

      setInvoices(invData);
      setRooms(roomsData.filter((r: any) => r.status === "RENTED"));
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayInvoice = async (id: number) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('next-auth.session-token='))?.split('=')[1] || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/invoices/${id}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentImageUrl: "" })
      });

      if (!res.ok) throw new Error("Lỗi khi thanh toán");
      toast.success("Đã xác nhận thu tiền thành công!");
      fetchData();
    } catch (error) {
      toast.error("Không thể xác nhận thu tiền.");
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý Hóa đơn</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo mới, theo dõi và quản lý các khoản thu tiền phòng, điện nước.</p>
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
                filteredInvoices.map((inv) => (
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
                        <button className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
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
        onOpenChange={setIsModalOpen} 
        rooms={rooms}
        onSuccess={fetchData}
      />
    </div>
  );
}
