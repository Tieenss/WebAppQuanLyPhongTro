"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowRight, LoaderCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";

type ModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: any[];
  onSuccess: () => void;
};

export function CreateInvoiceModal({ isOpen, onOpenChange, rooms, onSuccess }: ModalProps) {
  const [step, setStep] = useState(1);
  const [utilityRecordId, setUtilityRecordId] = useState<number | null>(null);
  
  // Step 1 Form
  const { register: regStep1, handleSubmit: handleStep1, formState: { errors: err1, isSubmitting: isSub1 } } = useForm();
  
  // Step 2 Form
  const { register: regStep2, handleSubmit: handleStep2, formState: { errors: err2, isSubmitting: isSub2 } } = useForm();

  const onUtilitySubmit = async (data: any) => {
    try {
      // API call to create utility record
      const token = document.cookie.split('; ').find(row => row.startsWith('next-auth.session-token='))?.split('=')[1] || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/utilities`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          roomId: Number(data.roomId),
          recordDate: format(new Date(), 'yyyy-MM-dd'),
          electricityIndex: Number(data.electricityIndex),
          waterIndex: Number(data.waterIndex)
        })
      });

      if (!res.ok) throw new Error("Không thể tạo bản ghi điện nước");
      const resData = await res.json();
      setUtilityRecordId(resData.data.id);
      
      toast.success("Đã ghi nhận chỉ số điện nước thành công");
      setStep(2);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu chỉ số điện nước.");
    }
  };

  const onInvoiceSubmit = async (data: any) => {
    try {
      // For this step, we need the contractId associated with the room. 
      // Assuming we have to fetch the contract or it's passed down. For now, we use a mock contractId.
      const token = document.cookie.split('; ').find(row => row.startsWith('next-auth.session-token='))?.split('=')[1] || "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          contractId: 1, // MOCK: Should be dynamically fetched based on roomId
          utilityRecordId: utilityRecordId,
          electricityUnitPrice: Number(data.electricityUnitPrice),
          waterUnitPrice: Number(data.waterUnitPrice),
          servicePrice: Number(data.servicePrice),
          dueDate: data.dueDate
        })
      });

      if (!res.ok) throw new Error("Không thể lập hóa đơn");
      
      toast.success("Hóa đơn đã được phát hành thành công");
      onSuccess();
      onOpenChange(false);
      setStep(1);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo hóa đơn.");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setStep(1);
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <Dialog.Title className="text-xl font-bold text-slate-800">
              {step === 1 ? "Bước 1: Ghi Điện Nước" : "Bước 2: Lập Hóa Đơn"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-2 hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1(onUtilitySubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chọn phòng trọ</label>
                <select 
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  {...regStep1("roomId", { required: "Vui lòng chọn phòng" })}
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms?.map(room => (
                    <option key={room.id} value={room.id}>{room.roomNumber}</option>
                  ))}
                </select>
                {err1.roomId && <p className="text-xs text-red-500 mt-1">{String(err1.roomId.message)}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chỉ số điện (kWh)</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    {...regStep1("electricityIndex", { required: "Nhập chỉ số điện", min: 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chỉ số nước (Khối)</label>
                  <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    {...regStep1("waterIndex", { required: "Nhập chỉ số nước", min: 0 })}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSub1} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all">
                  {isSub1 ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <><span>Tiếp tục</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2(onInvoiceSubmit)} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Đã lưu chỉ số điện nước</p>
                  <p className="text-xs text-blue-700 mt-1">Hệ thống sẽ tự động tính toán dựa trên chỉ số tháng trước và chỉ số tháng này để ra số lượng tiêu thụ.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá điện (VNĐ)</label>
                  <input 
                    type="number" 
                    defaultValue="3500"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    {...regStep2("electricityUnitPrice", { required: true, min: 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá nước (VNĐ)</label>
                  <input 
                    type="number" 
                    defaultValue="25000"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    {...regStep2("waterUnitPrice", { required: true, min: 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phí dịch vụ chung (Rác, Wifi...)</label>
                <input 
                  type="number" 
                  defaultValue="150000"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  {...regStep2("servicePrice", { required: true, min: 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hạn thanh toán</label>
                <input 
                  type="date" 
                  defaultValue={format(new Date(new Date().setDate(new Date().getDate() + 5)), 'yyyy-MM-dd')}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  {...regStep2("dueDate", { required: true })}
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-all">
                  Quay lại
                </button>
                <button type="submit" disabled={isSub2} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
                  {isSub2 ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <><span>Phát hành Hóa đơn</span></>}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
