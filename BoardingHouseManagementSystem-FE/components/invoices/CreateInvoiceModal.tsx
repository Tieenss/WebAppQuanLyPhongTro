"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowRight, LoaderCircle, CheckCircle2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import apiClient from "@/lib/apiClient";
import { ImageUpload } from "@/app/(landlord)/landlord/tenants/_components/ImageUpload";
type ModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contracts: any[];
  onSuccess: () => void;
};

export function CreateInvoiceModal({ isOpen, onOpenChange, contracts, onSuccess }: ModalProps) {
  const [step, setStep] = useState(1);
  const [utilityRecordId, setUtilityRecordId] = useState<number | null>(null);
  const [oldUtility, setOldUtility] = useState<any>(null);
  const [isLoadingOldUtility, setIsLoadingOldUtility] = useState(false);
  const [electricityImage, setElectricityImage] = useState("");
  const [waterImage, setWaterImage] = useState("");
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  
  // Step 1 Form
  const { register: regStep1, handleSubmit: handleStep1, control: control1, setValue: setVal1, formState: { errors: err1, isSubmitting: isSub1 } } = useForm();
  
  // Step 2 Form
  const { register: regStep2, handleSubmit: handleStep2, control: control2, formState: { errors: err2, isSubmitting: isSub2 } } = useForm({
    defaultValues: {
      electricityUnitPrice: 3500,
      waterUnitPrice: 25000,
      servicePrice: 0,
      internetPrice: 0,
      cleaningPrice: 0,
      parkingPrice: 0,
      otherPrice: 0,
      debtFromPreviousMonth: 0,
      discount: 0,
      bankAccountId: "",
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 5)), 'yyyy-MM-dd')
    }
  });

  const selectedContractId = useWatch({ control: control1, name: "contractId" });
  const selectedContract = contracts?.find(c => c.id === Number(selectedContractId));

  // Step 2 Watch values for total calculation
  const s2 = useWatch({ control: control2 });
  
  const electricityIndexNew = useWatch({ control: control1, name: "electricityIndex" }) || 0;
  const waterIndexNew = useWatch({ control: control1, name: "waterIndex" }) || 0;

  const electricityUsage = Math.max(0, Number(electricityIndexNew) - (oldUtility?.electricityIndex || 0));
  const waterUsage = Math.max(0, Number(waterIndexNew) - (oldUtility?.waterIndex || 0));

  useEffect(() => {
    if (selectedContractId) {
      const fetchOldUtility = async () => {
        setIsLoadingOldUtility(true);
        try {
          const res = await apiClient.get(`/utilities/room/${selectedContract?.roomId}/latest`);
          const data = res.data?.data !== undefined ? res.data.data : res.data;
          setOldUtility(data);
          if (data) {
              setVal1("electricityIndex", data.electricityIndex);
              setVal1("waterIndex", data.waterIndex);
          } else {
              setVal1("electricityIndex", 0);
              setVal1("waterIndex", 0);
          }
        } catch (error) {
          console.error(error);
          setVal1("electricityIndex", 0);
          setVal1("waterIndex", 0);
        } finally {
          setIsLoadingOldUtility(false);
        }
      };
      fetchOldUtility();
    } else {
      setOldUtility(null);
    }
  }, [selectedContractId, selectedContract]);

  useEffect(() => {
    if (isOpen) {
      const fetchBankAccounts = async () => {
        try {
          const res = await apiClient.get('/bank-accounts');
          const data = res.data?.data !== undefined ? res.data.data : res.data;
          setBankAccounts(data || []);
          if (data && data.length > 0) {
            const defaultBank = data.find((b: any) => b.isDefault);
            if (defaultBank) {
              regStep2("bankAccountId").onChange({ target: { name: "bankAccountId", value: defaultBank.id }});
            } else {
              regStep2("bankAccountId").onChange({ target: { name: "bankAccountId", value: data[0].id }});
            }
          }
        } catch (error) {
          console.error("Failed to fetch bank accounts:", error);
        }
      };
      fetchBankAccounts();
    }
  }, [isOpen]);

  const onUtilitySubmit = async (data: any) => {
    try {
      const res = await apiClient.post(`/utilities`, {
        roomId: selectedContract?.roomId,
        recordDate: format(new Date(), 'yyyy-MM-dd'),
        electricityIndex: Number(data.electricityIndex),
        waterIndex: Number(data.waterIndex),
        electricityImage,
        waterImage
      });

      const resData = res.data?.data || res.data;
      setUtilityRecordId(resData.id);
      
      toast.success("Đã ghi nhận chỉ số điện nước thành công");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi lưu chỉ số điện nước.");
    }
  };

  const onInvoiceSubmit = async (data: any) => {
    try {
      await apiClient.post(`/invoices`, {
        contractId: selectedContract?.id,
        utilityRecordId: utilityRecordId,
        electricityUnitPrice: Number(data.electricityUnitPrice),
        waterUnitPrice: Number(data.waterUnitPrice),
        servicePrice: Number(data.servicePrice),
        internetPrice: Number(data.internetPrice),
        cleaningPrice: Number(data.cleaningPrice),
        parkingPrice: Number(data.parkingPrice),
        otherPrice: Number(data.otherPrice),
        debtFromPreviousMonth: Number(data.debtFromPreviousMonth),
        discount: Number(data.discount),
        bankAccountId: data.bankAccountId ? Number(data.bankAccountId) : null,
        dueDate: data.dueDate
      });
      
      toast.success("Hóa đơn đã được phát hành thành công");
      onSuccess();
      onOpenChange(false);
      setStep(1);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo hóa đơn.");
    }
  };

  const calcTotal = () => {
    const roomP = selectedContract?.rentalPrice || 0;
    const elecP = electricityUsage * (Number(s2.electricityUnitPrice) || 0);
    const waterP = waterUsage * (Number(s2.waterUnitPrice) || 0);
    const servP = Number(s2.servicePrice) || 0;
    const intP = Number(s2.internetPrice) || 0;
    const cleanP = Number(s2.cleaningPrice) || 0;
    const parkP = Number(s2.parkingPrice) || 0;
    const otherP = Number(s2.otherPrice) || 0;
    const debt = Number(s2.debtFromPreviousMonth) || 0;
    const disc = Number(s2.discount) || 0;
    
    return roomP + elecP + waterP + servP + intP + cleanP + parkP + otherP + debt - disc;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
          setStep(1);
          setVal1("contractId", "");
          setOldUtility(null);
          setElectricityImage("");
          setWaterImage("");
      }
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <Dialog.Title className="text-xl font-bold text-slate-800">
              {step === 1 ? "Bước 1: Ghi Điện Nước" : "Bước 2: Lập Hóa Đơn Chi Tiết"}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Hợp đồng (Phòng)</label>
                <select 
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  {...regStep1("contractId", { required: "Vui lòng chọn hợp đồng" })}
                >
                  <option value="">-- Chọn Hợp đồng / Phòng --</option>
                  {contracts?.map(c => (
                    <option key={c.id} value={c.id}>Phòng {c.roomNumber} - Khách: {c.tenantName}</option>
                  ))}
                </select>
                {err1.contractId && <p className="text-xs text-red-500 mt-1">{String(err1.contractId.message)}</p>}
              </div>
              
              {selectedContractId && (
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-800">⚡ Điện (kWh)</h3>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Chỉ số cũ {oldUtility?.recordDate ? `(Ngày ${format(new Date(oldUtility.recordDate), 'dd/MM')})` : ''}</label>
                      <input type="number" readOnly value={oldUtility?.electricityIndex || 0} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Chỉ số mới</label>
                      <input 
                        type="number" 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        {...regStep1("electricityIndex", { required: "Nhập chỉ số điện mới", min: oldUtility?.electricityIndex || 0 })}
                      />
                    </div>
                    <div className="text-sm font-medium text-emerald-600">
                      Tiêu thụ: {electricityUsage} kWh
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ảnh đồng hồ điện (Tùy chọn)</label>
                      <ImageUpload value={electricityImage} onChange={setElectricityImage} onRemove={() => setElectricityImage("")} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-800">💧 Nước (Khối)</h3>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Chỉ số cũ {oldUtility?.recordDate ? `(Ngày ${format(new Date(oldUtility.recordDate), 'dd/MM')})` : ''}</label>
                      <input type="number" readOnly value={oldUtility?.waterIndex || 0} className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Chỉ số mới</label>
                      <input 
                        type="number" 
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        {...regStep1("waterIndex", { required: "Nhập chỉ số nước mới", min: oldUtility?.waterIndex || 0 })}
                      />
                    </div>
                    <div className="text-sm font-medium text-emerald-600">
                      Tiêu thụ: {waterUsage} Khối
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ảnh đồng hồ nước (Tùy chọn)</label>
                      <ImageUpload value={waterImage} onChange={setWaterImage} onRemove={() => setWaterImage("")} />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSub1 || !selectedContractId || isLoadingOldUtility} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50">
                  {isSub1 ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <><span>Tiếp tục lập hóa đơn</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2(onInvoiceSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="col-span-2 flex justify-between items-center border-b border-slate-200 pb-2">
                   <span className="font-semibold text-slate-700">Tiền phòng (Theo Hợp đồng)</span>
                   <span className="font-bold text-lg">{new Intl.NumberFormat('vi-VN').format(selectedContract?.rentalPrice || 0)} VNĐ</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Đơn giá Điện (VNĐ/kWh)</label>
                  <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...regStep2("electricityUnitPrice", { required: true, min: 0 })} />
                  <p className="text-xs text-emerald-600 mt-1">= {new Intl.NumberFormat('vi-VN').format(electricityUsage * (Number(s2.electricityUnitPrice) || 0))} VNĐ</p>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Đơn giá Nước (VNĐ/Khối)</label>
                  <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...regStep2("waterUnitPrice", { required: true, min: 0 })} />
                  <p className="text-xs text-emerald-600 mt-1">= {new Intl.NumberFormat('vi-VN').format(waterUsage * (Number(s2.waterUnitPrice) || 0))} VNĐ</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phí Rác / Vệ sinh</label>
                  <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...regStep2("cleaningPrice")} />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phí Internet / Wifi</label>
                  <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...regStep2("internetPrice")} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phí Gửi Xe</label>
                  <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...regStep2("parkingPrice")} />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phí Khác (Dịch vụ chung...)</label>
                  <input type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...regStep2("servicePrice")} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-red-600 mb-1">Nợ cũ (Cộng thêm)</label>
                  <input type="number" className="w-full border border-red-200 bg-red-50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-red-700" {...regStep2("debtFromPreviousMonth")} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-600 mb-1">Giảm giá (Trừ đi)</label>
                  <input type="number" className="w-full border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-700" {...regStep2("discount")} />
                </div>
                
                <div className="col-span-2 mt-2 pt-4 border-t border-slate-200">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tài khoản nhận tiền (VietQR)</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    {...regStep2("bankAccountId")}
                  >
                    <option value="">-- Chọn tài khoản ngân hàng --</option>
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} {b.bankCode ? `(${b.bankCode})` : ''} - {b.accountNumber} - {b.accountHolder} {b.isDefault ? '(Mặc định)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                 <div className="w-1/2 pr-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hạn thanh toán</label>
                    <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...regStep2("dueDate", { required: true })} />
                 </div>
                 <div className="w-1/2 text-right">
                    <p className="text-sm text-slate-500">Tổng tiền thanh toán</p>
                    <p className="text-3xl font-extrabold text-blue-700">{new Intl.NumberFormat('vi-VN').format(calcTotal())} đ</p>
                 </div>
              </div>

              <div className="pt-6 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-all">
                  Quay lại
                </button>
                <button type="submit" disabled={isSub2} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
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
