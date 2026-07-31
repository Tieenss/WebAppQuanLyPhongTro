"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Printer, Download } from "lucide-react";
import { format } from "date-fns";

type ViewInvoiceModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any | null;
};

export function ViewInvoiceModal({ isOpen, onOpenChange, invoice }: ViewInvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 print:hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] bg-white p-0 shadow-2xl duration-200 print:shadow-none print:w-full print:max-w-none print:translate-x-0 print:translate-y-0 print:left-0 print:top-0 print:relative sm:rounded-2xl max-h-[95vh] overflow-hidden flex flex-col font-sans">
          
          <div className="flex items-center justify-between border-b p-4 bg-slate-50 print:hidden">
            <Dialog.Title className="text-lg font-bold text-slate-800">
              Chi tiết Hóa Đơn
            </Dialog.Title>
            <div className="flex items-center space-x-2">
              <button onClick={handlePrint} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center">
                <Printer className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">In hóa đơn</span>
              </button>
              <Dialog.Close asChild>
                <button className="rounded-full p-2 hover:bg-slate-200 transition-colors">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="p-8 overflow-y-auto print:p-4 flex-1 bg-white" id="printable-invoice">
            {/* INVOICE HEADER */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-800">Hóa Đơn Tiền Nhà</h1>
            </div>

            <div className="mb-8">
              <p className="text-sm text-slate-500 mb-1">Khách hàng</p>
              <p className="font-bold text-slate-800 text-lg">Phòng {invoice.roomName || "N/A"}</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8 border-t border-b py-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Mã hoá đơn</p>
                <p className="font-semibold text-slate-800">{invoice.invoiceCode || `#INV-${invoice.id}`}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày lập</p>
                <p className="font-semibold text-slate-800">
                  {invoice.createdAt ? format(new Date(invoice.createdAt), 'dd/MM/yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Hạn thanh toán</p>
                <p className="font-semibold text-slate-800">
                  {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd/MM/yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                <p className={`font-semibold ${invoice.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {invoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </p>
              </div>
            </div>

            {/* INVOICE TABLE */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-16">STT</th>
                    <th className="px-4 py-3 font-semibold">SẢN PHẨM</th>
                    <th className="px-4 py-3 font-semibold text-center w-20">SL</th>
                    <th className="px-4 py-3 font-semibold text-right w-32">ĐƠN GIÁ</th>
                    <th className="px-4 py-3 font-semibold text-right w-40">THÀNH TIỀN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(() => {
                    const items = [];
                    if (invoice.roomPrice > 0) items.push({ name: 'Tiền phòng', qty: 1, price: invoice.roomPrice, total: invoice.roomPrice });
                    if (invoice.electricityPrice > 0) items.push({ name: 'Tiền điện', qty: null, price: null, total: invoice.electricityPrice });
                    if (invoice.waterPrice > 0) items.push({ name: 'Tiền nước', qty: null, price: null, total: invoice.waterPrice });
                    if (invoice.servicePrice > 0) items.push({ name: 'Phí dịch vụ chung', qty: null, price: null, total: invoice.servicePrice });
                    if (invoice.internetPrice > 0) items.push({ name: 'Phí Internet/Wifi', qty: null, price: null, total: invoice.internetPrice });
                    if (invoice.cleaningPrice > 0) items.push({ name: 'Phí vệ sinh/rác', qty: null, price: null, total: invoice.cleaningPrice });
                    if (invoice.parkingPrice > 0) items.push({ name: 'Phí giữ xe', qty: null, price: null, total: invoice.parkingPrice });
                    if (invoice.otherPrice > 0) items.push({ name: 'Phụ thu khác', qty: null, price: null, total: invoice.otherPrice });
                    
                    return items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-center">{item.qty !== null ? item.qty : '-'}</td>
                        <td className="px-4 py-3 text-right">{item.price !== null ? new Intl.NumberFormat('vi-VN').format(item.price) : '-'}</td>
                        <td className="px-4 py-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(item.total)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* INVOICE SUMMARY */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-t border-slate-200 pt-6">
              <div className="w-full md:w-1/2 text-sm text-slate-600">
                <p className="font-semibold text-slate-800 mb-2">Ghi chú:</p>
                <p>Quý Khách vui lòng thanh toán đúng hạn để đảm bảo quyền lợi thuê phòng. Quét mã QR thanh toán và không thay đổi nội dung, để hệ thống xác nhận tự động chính xác. Xin cảm ơn!</p>
              </div>
              <div className="w-full md:w-1/2 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tạm tính:</span>
                  <span className="font-medium text-slate-800">{new Intl.NumberFormat('vi-VN').format((invoice.totalAmount || 0) - (invoice.debtFromPreviousMonth || 0) + (invoice.discount || 0))}</span>
                </div>
                {invoice.debtFromPreviousMonth > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Nợ cũ:</span>
                    <span className="font-medium text-red-600">+{new Intl.NumberFormat('vi-VN').format(invoice.debtFromPreviousMonth)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Giảm giá:</span>
                    <span className="font-medium text-emerald-600">-{new Intl.NumberFormat('vi-VN').format(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-lg font-bold text-slate-800">Tổng tiền:</span>
                  <span className="text-xl font-extrabold text-blue-700">{new Intl.NumberFormat('vi-VN').format(invoice.totalAmount || 0)} đ</span>
                </div>
              </div>
            </div>

            {/* QR CODE & BANK INFO */}
            {invoice.status !== 'PAID' && (
              <div className="mt-12 flex items-center justify-center gap-8 bg-slate-50 p-6 rounded-xl border border-slate-200 print:break-inside-avoid">
                <div className="w-32 h-32 bg-white rounded-lg border flex flex-col items-center justify-center p-1 shrink-0 overflow-hidden shadow-sm">
                  {invoice.bankCode && invoice.bankAccountNumber ? (
                    <img 
                      src={`https://img.vietqr.io/image/${invoice.bankCode}-${invoice.bankAccountNumber}-compact2.png?amount=${(invoice.totalAmount || 0) - (invoice.debtFromPreviousMonth || 0) + (invoice.discount || 0)}&addInfo=${encodeURIComponent(invoice.invoiceCode || `INV${invoice.id}`)}&accountName=${encodeURIComponent(invoice.bankAccountHolder || '')}`}
                      alt="VietQR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 text-center">Chưa có<br/>thông tin<br/>ngân hàng</span>
                  )}
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex">
                    <span className="w-24 text-slate-500">Số tài khoản:</span>
                    <span className="font-semibold text-slate-800">{invoice.bankAccountNumber || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500">Ngân hàng:</span>
                    <span className="font-semibold text-slate-800">{invoice.bankName || 'N/A'} {invoice.bankCode ? `(${invoice.bankCode})` : ''}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500">Tên tài khoản:</span>
                    <span className="font-semibold text-slate-800 uppercase">{invoice.bankAccountHolder || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500">Số tiền:</span>
                    <span className="font-semibold text-slate-800">{new Intl.NumberFormat('vi-VN').format((invoice.totalAmount || 0) - (invoice.debtFromPreviousMonth || 0) + (invoice.discount || 0))} đ</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500">Nội dung:</span>
                    <span className="font-semibold text-slate-800">{invoice.invoiceCode || `INV${invoice.id}`}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
