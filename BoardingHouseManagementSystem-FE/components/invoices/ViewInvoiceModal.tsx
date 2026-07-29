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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
          
          <div className="flex items-center justify-between border-b p-6 bg-slate-50">
            <div>
              <Dialog.Title className="text-xl font-bold text-slate-800">
                Hóa đơn {invoice.invoiceCode || `#INV-${invoice.id}`}
              </Dialog.Title>
              <p className="text-sm text-slate-500 mt-1">
                Tạo ngày: {invoice.createdAt ? format(new Date(invoice.createdAt), 'dd/MM/yyyy') : 'N/A'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={handlePrint} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center print:hidden">
                <Printer className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">In</span>
              </button>
              <Dialog.Close asChild>
                <button className="rounded-full p-2 hover:bg-slate-200 transition-colors print:hidden">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="p-6 overflow-y-auto print:p-0 print:overflow-visible flex-1">
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Trạng thái</p>
                  <p className={`font-bold ${invoice.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {invoice.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Hạn thanh toán</p>
                  <p className="font-bold text-slate-800">
                    {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd/MM/yyyy') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Khoản mục</th>
                      <th className="px-4 py-3 font-semibold text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="px-4 py-3">Tiền thuê phòng</td>
                      <td className="px-4 py-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(invoice.roomPrice || 0)} đ</td>
                    </tr>
                    {(invoice.electricityPrice > 0 || invoice.waterPrice > 0) && (
                      <>
                        <tr>
                          <td className="px-4 py-3">Tiền điện</td>
                          <td className="px-4 py-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(invoice.electricityPrice || 0)} đ</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Tiền nước</td>
                          <td className="px-4 py-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(invoice.waterPrice || 0)} đ</td>
                        </tr>
                      </>
                    )}
                    {invoice.servicePrice > 0 && (
                      <tr>
                        <td className="px-4 py-3">Phí dịch vụ chung</td>
                        <td className="px-4 py-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(invoice.servicePrice)} đ</td>
                      </tr>
                    )}
                    {invoice.internetPrice > 0 && (
                      <tr>
                        <td className="px-4 py-3">Phí Internet/Wifi</td>
                        <td className="px-4 py-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(invoice.internetPrice)} đ</td>
                      </tr>
                    )}
                    {invoice.cleaningPrice > 0 && (
                      <tr>
                        <td className="px-4 py-3">Phí vệ sinh/rác</td>
                        <td className="px-4 py-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(invoice.cleaningPrice)} đ</td>
                      </tr>
                    )}
                    {invoice.parkingPrice > 0 && (
                      <tr>
                        <td className="px-4 py-3">Phí giữ xe</td>
                        <td className="px-4 py-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(invoice.parkingPrice)} đ</td>
                      </tr>
                    )}
                    {invoice.otherPrice > 0 && (
                      <tr>
                        <td className="px-4 py-3">Phụ thu khác</td>
                        <td className="px-4 py-3 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(invoice.otherPrice)} đ</td>
                      </tr>
                    )}
                    {invoice.debtFromPreviousMonth > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-red-600">Nợ cũ</td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">+{new Intl.NumberFormat('vi-VN').format(invoice.debtFromPreviousMonth)} đ</td>
                      </tr>
                    )}
                    {invoice.discount > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-emerald-600">Giảm giá</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600">-{new Intl.NumberFormat('vi-VN').format(invoice.discount)} đ</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td className="px-4 py-4 font-bold text-slate-800 text-base">Tổng cộng</td>
                      <td className="px-4 py-4 text-right font-extrabold text-blue-700 text-lg">
                        {new Intl.NumberFormat('vi-VN').format(invoice.totalAmount || 0)} đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
