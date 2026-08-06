"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/apiClient";
import { Receipt, CheckCircle, Clock, AlertCircle, Search, CreditCard, X, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

export default function TenantInvoicesPage() {
  const { data: invoices, error, mutate } = useSWR("/invoices", fetcher);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);

  const isLoading = !invoices && !error;
  const invoiceList = Array.isArray(invoices?.data) ? invoices.data : invoices?.data?.data || invoices || [];

  const filteredInvoices = useMemo(() => {
    let result = invoiceList;
    if (activeTab !== "ALL") {
      result = result.filter((inv: any) => inv.status === activeTab);
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter((inv: any) => inv.invoiceCode?.toLowerCase().includes(query));
    }
    return result;
  }, [invoiceList, activeTab, searchQuery]);

  const handleOpenPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setReceiptImage(null);
    setIsPaymentModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptImage(e.target.files[0]);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!receiptImage) {
      toast.error("Vui lòng tải lên ảnh biên lai chuyển khoản");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", receiptImage);

      const uploadRes = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const imageUrl = uploadRes.data.imageUrl || uploadRes.data.data?.imageUrl;

      await apiClient.put(`/invoices/${selectedInvoice.id}/tenant-pay`, {
        paymentImageUrl: imageUrl
      });

      toast.success("Đã gửi biên lai thanh toán thành công!");
      setIsPaymentModalOpen(false);
      mutate(); // Refresh data
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải ảnh lên hoặc gửi xác nhận");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (inv: any) => {
    if (inv.status === "PENDING" && inv.paymentImageUrl) {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Chờ xác nhận</span>;
    }
    switch (inv.status) {
      case "PENDING":
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Chưa thanh toán</span>;
      case "PAID":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Đã thanh toán</span>;
      case "OVERDUE":
        return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Quá hạn</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{inv.status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Receipt className="w-8 h-8" /> Hóa đơn của tôi
          </h1>
          <p className="text-blue-100 opacity-90">Theo dõi, quản lý và thanh toán các hóa đơn hàng tháng của bạn</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          {["ALL", "PENDING", "PAID", "OVERDUE"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab === "ALL" ? "Tất cả" : tab === "PENDING" ? "Chưa thanh toán" : tab === "PAID" ? "Đã thanh toán" : "Quá hạn"}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã hóa đơn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-500">Đang tải dữ liệu...</div>
      ) : filteredInvoices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((inv: any) => (
            <div key={inv.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{inv.invoiceCode}</h3>
                  <p className="text-slate-500 text-xs">Hạn chót: {formatDate(inv.dueDate)}</p>
                </div>
                {getStatusBadge(inv)}
              </div>
              
              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tiền phòng:</span>
                  <span className="font-medium">{formatCurrency(inv.roomPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Điện nước & Dịch vụ:</span>
                  <span className="font-medium">
                    {formatCurrency((inv.electricityPrice || 0) + (inv.waterPrice || 0) + (inv.servicePrice || 0))}
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-2 mt-2 flex justify-between">
                  <span className="text-slate-800 font-bold">Tổng cộng:</span>
                  <span className="text-blue-600 font-bold text-lg">{formatCurrency(inv.totalAmount)}</span>
                </div>
              </div>

              {inv.status === "PENDING" && (
                <button
                  onClick={() => handleOpenPayment(inv)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Thanh toán ngay
                </button>
              )}
              {inv.status === "PAID" && inv.paymentImageUrl && (
                <a href={inv.paymentImageUrl} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors flex justify-center items-center gap-2 text-sm border border-slate-200">
                  <FileText className="w-4 h-4" /> Xem biên lai
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Không có hóa đơn nào</h3>
          <p className="text-slate-500">Bạn không có hóa đơn nào phù hợp với bộ lọc hiện tại.</p>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-50 rounded-3xl w-full max-w-[1200px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-white sticky top-0 z-10 rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Thanh toán hóa đơn</h2>
                <p className="text-sm text-slate-500 mt-1">Mã HĐ: <span className="font-semibold text-slate-700">{selectedInvoice.invoiceCode}</span></p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Payment Info & Upload */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center border border-slate-200 shadow-sm">
                  <div className="bg-blue-50 text-blue-700 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-6">Quét mã VietQR</div>
                  {selectedInvoice.bankCode && selectedInvoice.bankAccountNumber ? (
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                      <img 
                        src={`https://img.vietqr.io/image/${selectedInvoice.bankCode}-${selectedInvoice.bankAccountNumber}-qr_only.png?amount=${selectedInvoice.totalAmount}&addInfo=${selectedInvoice.invoiceCode}&accountName=${selectedInvoice.bankAccountHolder || ""}`} 
                        alt="VietQR" 
                        className="relative w-64 h-64 rounded-xl shadow-md border border-slate-100 bg-white p-3 transition-transform hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-sm text-center p-6">
                      <svg className="w-12 h-12 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      Chủ trọ chưa thiết lập thông tin ngân hàng
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center"><span className="w-1.5 h-4 bg-indigo-500 rounded-full mr-2"></span>Chuyển khoản thủ công</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-slate-500">Ngân hàng:</span> <span className="font-semibold text-slate-800">{selectedInvoice.bankName || "N/A"}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500">Số tài khoản:</span> <span className="font-bold text-slate-900 tracking-wide">{selectedInvoice.bankAccountNumber || "N/A"}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500">Chủ tài khoản:</span> <span className="font-semibold text-slate-800 uppercase">{selectedInvoice.bankAccountHolder || "N/A"}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500">Số tiền:</span> <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{formatCurrency(selectedInvoice.totalAmount)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500">Nội dung:</span> <span className="font-mono font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">{selectedInvoice.invoiceCode}</span></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <label className="flex items-center text-sm font-bold text-slate-800"><span className="w-1.5 h-4 bg-emerald-500 rounded-full mr-2"></span>Xác nhận thanh toán</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer group relative overflow-hidden">
                    <input type="file" id="receipt" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="receipt" className="cursor-pointer flex flex-col items-center w-full">
                      {receiptImage ? (
                        <div className="relative w-full flex justify-center">
                          <img src={URL.createObjectURL(receiptImage)} alt="Preview" className="max-h-64 object-contain rounded-lg shadow-sm" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                             <p className="text-white text-sm font-medium">Nhấn để thay đổi ảnh</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center">
                          <Upload className="w-8 h-8 text-slate-400 mb-3 group-hover:text-blue-500 transition-colors" />
                          <p className="text-sm font-medium text-slate-700">Tải lên hình ảnh biên lai</p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG tối đa 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Invoice Details Table */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-4 mb-4 flex items-center"><span className="w-1.5 h-5 bg-blue-500 rounded-full mr-2"></span>Chi tiết các khoản phí</h3>
                
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-4 font-semibold w-12 text-center">STT</th>
                        <th className="px-4 py-4 font-semibold">SẢN PHẨM</th>
                        <th className="px-2 py-4 font-semibold text-center w-16">CŨ</th>
                        <th className="px-2 py-4 font-semibold text-center w-16">MỚI</th>
                        <th className="px-4 py-4 font-semibold text-center w-16">SL</th>
                        <th className="px-4 py-4 font-semibold text-right w-28">ĐƠN GIÁ</th>
                        <th className="px-4 py-4 font-semibold text-right w-32">THÀNH TIỀN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {(() => {
                        const items = [];
                        if (selectedInvoice.roomPrice > 0) items.push({ name: 'Tiền phòng', oldIndex: null, newIndex: null, qty: 1, price: selectedInvoice.roomPrice, total: selectedInvoice.roomPrice });
                        if (selectedInvoice.electricityPrice > 0) items.push({ 
                          name: 'Tiền điện',
                          oldIndex: selectedInvoice.oldElectricityIndex,
                          newIndex: selectedInvoice.newElectricityIndex,
                          qty: selectedInvoice.electricityUsage, price: selectedInvoice.electricityUnitPrice, total: selectedInvoice.electricityPrice 
                        });
                        if (selectedInvoice.waterPrice > 0) items.push({ 
                          name: 'Tiền nước',
                          oldIndex: selectedInvoice.oldWaterIndex,
                          newIndex: selectedInvoice.newWaterIndex,
                          qty: selectedInvoice.waterUsage, price: selectedInvoice.waterUnitPrice, total: selectedInvoice.waterPrice 
                        });
                        if (selectedInvoice.servicePrice > 0) items.push({ name: 'Phí dịch vụ chung', oldIndex: null, newIndex: null, qty: selectedInvoice.serviceQuantity, price: selectedInvoice.serviceUnitPrice, total: selectedInvoice.servicePrice });
                        if (selectedInvoice.internetPrice > 0) items.push({ name: 'Phí Internet/Wifi', oldIndex: null, newIndex: null, qty: selectedInvoice.internetQuantity, price: selectedInvoice.internetUnitPrice, total: selectedInvoice.internetPrice });
                        if (selectedInvoice.cleaningPrice > 0) items.push({ name: 'Phí vệ sinh/rác', oldIndex: null, newIndex: null, qty: selectedInvoice.cleaningQuantity, price: selectedInvoice.cleaningUnitPrice, total: selectedInvoice.cleaningPrice });
                        if (selectedInvoice.parkingPrice > 0) items.push({ name: 'Phí giữ xe', oldIndex: null, newIndex: null, qty: selectedInvoice.parkingQuantity, price: selectedInvoice.parkingUnitPrice, total: selectedInvoice.parkingPrice });
                        if (selectedInvoice.otherPrice > 0) items.push({ name: 'Phụ thu khác', oldIndex: null, newIndex: null, qty: null, price: null, total: selectedInvoice.otherPrice });
                        
                        return items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 text-slate-400 text-center text-xs font-medium">{idx + 1}</td>
                            <td className="px-4 py-3.5 font-medium text-slate-800">{item.name}</td>
                            <td className="px-2 py-3.5 text-center text-slate-500 bg-slate-50/30 text-xs">{item.oldIndex !== null && item.oldIndex !== undefined ? item.oldIndex : '-'}</td>
                            <td className="px-2 py-3.5 text-center text-slate-500 bg-slate-50/30 text-xs">{item.newIndex !== null && item.newIndex !== undefined ? item.newIndex : '-'}</td>
                            <td className="px-4 py-3.5 text-center text-slate-600 bg-slate-50/50">{item.qty !== null ? item.qty : '-'}</td>
                            <td className="px-4 py-3.5 text-right text-slate-600">{item.price !== null ? new Intl.NumberFormat('vi-VN').format(item.price) : '-'}</td>
                            <td className="px-4 py-3.5 text-right font-semibold text-slate-800">{new Intl.NumberFormat('vi-VN').format(item.total)}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex flex-col items-end gap-3 mt-6 pt-6 text-sm">
                  <div className="flex justify-between w-full sm:w-72 text-slate-500 px-4">
                    <span>Tạm tính:</span>
                    <span className="font-medium text-slate-700">{new Intl.NumberFormat('vi-VN').format((selectedInvoice.totalAmount || 0) - (selectedInvoice.debtFromPreviousMonth || 0) + (selectedInvoice.discount || 0))} đ</span>
                  </div>
                  {selectedInvoice.debtFromPreviousMonth > 0 && (
                    <div className="flex justify-between w-full sm:w-72 text-slate-500 px-4">
                      <span>Nợ cũ:</span>
                      <span className="font-medium text-red-600">+{new Intl.NumberFormat('vi-VN').format(selectedInvoice.debtFromPreviousMonth)} đ</span>
                    </div>
                  )}
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between w-full sm:w-72 text-slate-500 px-4">
                      <span>Giảm giá:</span>
                      <span className="font-medium text-emerald-600">-{new Intl.NumberFormat('vi-VN').format(selectedInvoice.discount)} đ</span>
                    </div>
                  )}
                  
                  <div className="w-full sm:w-80 h-px bg-slate-200 my-2"></div>
                  
                  <div className="flex justify-between w-full sm:w-80 px-4 items-center">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">TỔNG CỘNG</span>
                    <span className="text-2xl font-black text-blue-700 tracking-tight">{new Intl.NumberFormat('vi-VN').format(selectedInvoice.totalAmount || 0)} <span className="text-base font-bold text-blue-500">đ</span></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setIsPaymentModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                Hủy bỏ
              </button>
              <button 
                onClick={handlePaymentSubmit} 
                disabled={uploading || !receiptImage}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                {uploading ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
