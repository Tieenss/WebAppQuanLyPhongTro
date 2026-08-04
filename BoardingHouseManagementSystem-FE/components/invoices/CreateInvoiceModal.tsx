"use client";

import { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowRight, LoaderCircle, CheckCircle2, Download, Eye } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import apiClient from "@/lib/apiClient";
import { ImageUpload } from "@/app/(landlord)/landlord/tenants/_components/ImageUpload";
import html2canvas from "html2canvas";

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
  
  const [isSavingUtility, setIsSavingUtility] = useState(false);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Step 1 Form
  const { register: regStep1, handleSubmit: handleStep1, control: control1, setValue: setVal1, formState: { errors: err1 }, getValues: getVal1 } = useForm();
  
  // Step 2 Form
  const { register: regStep2, handleSubmit: handleStep2, control: control2, setValue: setVal2, getValues: getVal2 } = useForm({
    defaultValues: {
      electricityUnitPrice: 3500,
      waterUnitPrice: 25000,
      serviceQuantity: 1,
      serviceUnitPrice: 0,
      internetQuantity: 1,
      internetUnitPrice: 0,
      cleaningQuantity: 1,
      cleaningUnitPrice: 0,
      parkingQuantity: 0,
      parkingUnitPrice: 0,
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

      // Auto-fill Step 2 values from Contract
      setVal2("electricityUnitPrice", selectedContract?.electricityPrice || 0);
      setVal2("waterUnitPrice", selectedContract?.waterPrice || 0);
      setVal2("serviceUnitPrice", selectedContract?.servicePrice || 0);
      setVal2("internetUnitPrice", selectedContract?.wifiPrice || 0);
      setVal2("parkingUnitPrice", selectedContract?.parkingPrice || 0);
    } else {
      setOldUtility(null);
    }
  }, [selectedContractId, selectedContract, setVal1, setVal2]);

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
  }, [isOpen, regStep2]);

  const onUtilitySubmit = async (data: any) => {
    setStep(2);
  };

  const goToPreview = () => {
    setStep(3);
  };

  const onInvoiceSubmit = async () => {
    if (isSavingInvoice) return;
    setIsSavingInvoice(true);
    const dataStep1 = getVal1();
    const data = getVal2();
    try {
      const utilRes = await apiClient.post(`/utilities`, {
        roomId: selectedContract?.roomId,
        recordDate: format(new Date(), 'yyyy-MM-dd'),
        electricityIndex: Number(dataStep1.electricityIndex),
        waterIndex: Number(dataStep1.waterIndex),
        electricityImage,
        waterImage
      });
      const resData = utilRes.data?.data || utilRes.data;
      const newUtilityRecordId = resData.id;

      await apiClient.post(`/invoices`, {
        contractId: selectedContract?.id,
        utilityRecordId: newUtilityRecordId,
        electricityUnitPrice: Number(data.electricityUnitPrice),
        waterUnitPrice: Number(data.waterUnitPrice),
        serviceQuantity: Number(data.serviceQuantity) || 1,
        serviceUnitPrice: Number(data.serviceUnitPrice) || 0,
        internetQuantity: Number(data.internetQuantity) || 1,
        internetUnitPrice: Number(data.internetUnitPrice) || 0,
        cleaningQuantity: Number(data.cleaningQuantity) || 1,
        cleaningUnitPrice: Number(data.cleaningUnitPrice) || 0,
        parkingQuantity: Number(data.parkingQuantity) || 0,
        parkingUnitPrice: Number(data.parkingUnitPrice) || 0,
        otherPrice: Number(data.otherPrice) || 0,
        debtFromPreviousMonth: Number(data.debtFromPreviousMonth) || 0,
        discount: Number(data.discount) || 0,
        bankAccountId: data.bankAccountId ? Number(data.bankAccountId) : null,
        dueDate: data.dueDate
      });
      
      toast.success("Hóa đơn đã được phát hành thành công");
      onSuccess();
      onOpenChange(false);
      setStep(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo hóa đơn.");
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const calcTotal = () => {
    const roomP = selectedContract?.rentalPrice || 0;
    const elecP = electricityUsage * (Number(s2.electricityUnitPrice) || 0);
    const waterP = waterUsage * (Number(s2.waterUnitPrice) || 0);
    const servP = (Number(s2.serviceQuantity) || 1) * (Number(s2.serviceUnitPrice) || 0);
    const intP = (Number(s2.internetQuantity) || 1) * (Number(s2.internetUnitPrice) || 0);
    const cleanP = (Number(s2.cleaningQuantity) || 1) * (Number(s2.cleaningUnitPrice) || 0);
    const parkP = (Number(s2.parkingQuantity) || 0) * (Number(s2.parkingUnitPrice) || 0);
    const otherP = Number(s2.otherPrice) || 0;
    const debt = Number(s2.debtFromPreviousMonth) || 0;
    const disc = Number(s2.discount) || 0;
    
    return roomP + elecP + waterP + servP + intP + cleanP + parkP + otherP + debt - disc;
  };

  const selectedBank = bankAccounts.find(b => b.id === Number(s2.bankAccountId));

  const handleDownloadPNG = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const link = document.createElement('a');
      link.download = `HoaDon_P${selectedContract?.roomNumber}_${format(new Date(), 'M_yyyy')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      toast.error("Không thể xuất ảnh");
    } finally {
      setIsDownloading(false);
    }
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
        <Dialog.Content className={`fixed left-[50%] top-[50%] z-50 ${step === 3 ? 'w-full max-w-4xl' : 'w-full max-w-2xl'} translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between border-b pb-4 mb-4 shrink-0">
            <Dialog.Title className="text-xl font-bold text-slate-800">
              {step === 1 ? "Bước 1: Ghi Điện Nước" : step === 2 ? "Bước 2: Lập Hóa Đơn Chi Tiết" : "Bước 3: Xem Trước & Phát Hành"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-2 hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex items-center space-x-4 mb-6 shrink-0">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
            <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
          </div>

          <div className="overflow-y-auto pr-2 pb-2 flex-1">
            {step === 1 && (
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
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={!selectedContractId || isLoadingOldUtility} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50">
                    <span>Tiếp tục</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2(goToPreview)} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                     <span className="font-semibold text-slate-700">Tiền phòng (Theo Hợp đồng)</span>
                     <span className="font-bold text-lg text-slate-800">{new Intl.NumberFormat('vi-VN').format(selectedContract?.rentalPrice || 0)} đ</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 bg-white border border-slate-200 rounded-lg p-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">⚡ Đơn giá Điện (đ/kWh)</label>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input type="number" className="w-20 sm:w-28 border border-slate-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" {...regStep2("electricityUnitPrice", { required: true, min: 0 })} />
                        <span className="text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">x {electricityUsage} =</span>
                        <p className="text-sm font-bold text-slate-800 flex-1 text-right">{new Intl.NumberFormat('vi-VN').format(electricityUsage * (Number(s2.electricityUnitPrice) || 0))} đ</p>
                      </div>
                    </div>
                    
                    <div className="col-span-2 bg-white border border-slate-200 rounded-lg p-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">💧 Đơn giá Nước (đ/Khối)</label>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input type="number" className="w-20 sm:w-28 border border-slate-300 rounded-lg px-2 sm:px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" {...regStep2("waterUnitPrice", { required: true, min: 0 })} />
                        <span className="text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">x {waterUsage} =</span>
                        <p className="text-sm font-bold text-slate-800 flex-1 text-right">{new Intl.NumberFormat('vi-VN').format(waterUsage * (Number(s2.waterUnitPrice) || 0))} đ</p>
                      </div>
                    </div>

                    <div className="col-span-2 bg-white border border-slate-200 rounded-lg p-3">
                      <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Phí Rác/Vệ sinh</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="SL" defaultValue={1} className="w-16 sm:w-20 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700" {...regStep2("cleaningQuantity")} />
                        <span className="text-xs text-slate-500 font-medium">x</span>
                        <input type="number" placeholder="Đơn giá" className="w-24 sm:w-28 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700" {...regStep2("cleaningUnitPrice")} />
                        <span className="text-xs font-bold text-slate-800 ml-auto whitespace-nowrap">
                          = {new Intl.NumberFormat('vi-VN').format((Number(s2.cleaningQuantity) || 1) * (Number(s2.cleaningUnitPrice) || 0))} đ
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-2 bg-white border border-slate-200 rounded-lg p-3">
                      <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Internet/Wifi</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="SL" defaultValue={1} className="w-16 sm:w-20 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700" {...regStep2("internetQuantity")} />
                        <span className="text-xs text-slate-500 font-medium">x</span>
                        <input type="number" placeholder="Đơn giá" className="w-24 sm:w-28 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700" {...regStep2("internetUnitPrice")} />
                        <span className="text-xs font-bold text-slate-800 ml-auto whitespace-nowrap">
                          = {new Intl.NumberFormat('vi-VN').format((Number(s2.internetQuantity) || 1) * (Number(s2.internetUnitPrice) || 0))} đ
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 bg-white border border-slate-200 rounded-lg p-3">
                      <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Gửi Xe</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="SL" defaultValue={0} className="w-16 sm:w-20 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700" {...regStep2("parkingQuantity")} />
                        <span className="text-xs text-slate-500 font-medium">x</span>
                        <input type="number" placeholder="Đơn giá" className="w-24 sm:w-28 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700" {...regStep2("parkingUnitPrice")} />
                        <span className="text-xs font-bold text-slate-800 ml-auto whitespace-nowrap">
                          = {new Intl.NumberFormat('vi-VN').format((Number(s2.parkingQuantity) || 0) * (Number(s2.parkingUnitPrice) || 0))} đ
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-2 bg-white border border-slate-200 rounded-lg p-3">
                      <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Dịch vụ chung</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="SL" defaultValue={1} className="w-16 sm:w-20 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700" {...regStep2("serviceQuantity")} />
                        <span className="text-xs text-slate-500 font-medium">x</span>
                        <input type="number" placeholder="Đơn giá" className="w-24 sm:w-28 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700" {...regStep2("serviceUnitPrice")} />
                        <span className="text-xs font-bold text-slate-800 ml-auto whitespace-nowrap">
                          = {new Intl.NumberFormat('vi-VN').format((Number(s2.serviceQuantity) || 1) * (Number(s2.serviceUnitPrice) || 0))} đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                    <div>
                      <label className="block text-xs font-semibold text-red-600 mb-1">Nợ cũ (+)</label>
                      <input type="number" className="w-full border border-red-200 bg-red-50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-red-700 text-sm font-bold" {...regStep2("debtFromPreviousMonth")} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-600 mb-1">Giảm giá (-)</label>
                      <input type="number" className="w-full border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-700 text-sm font-bold" {...regStep2("discount")} />
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-4 border-t border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tài khoản nhận tiền (VietQR)</label>
                    <select 
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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

                <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
                   <div className="w-full sm:w-1/2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Hạn thanh toán</label>
                      <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...regStep2("dueDate", { required: true })} />
                   </div>
                   <div className="w-full sm:w-1/2 bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-end justify-center">
                      <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">Tổng Tiền</p>
                      <p className="text-3xl font-extrabold text-blue-800">{new Intl.NumberFormat('vi-VN').format(calcTotal())} đ</p>
                   </div>
                </div>

                <div className="pt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-all">
                    Quay lại
                  </button>
                  <button type="submit" className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg">
                    <Eye className="w-4 h-4" />
                    <span>Xem trước hóa đơn</span>
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div 
                  ref={receiptRef} 
                  className="bg-white p-6 sm:p-10 border border-slate-200 rounded-xl shadow-sm mx-auto max-w-2xl font-sans"
                >
                  <div className="text-center mb-6 border-b border-dashed border-slate-300 pb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-800">Hóa Đơn Tiền Nhà</h2>
                    <p className="text-sm text-slate-500 mt-1">Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</p>
                  </div>

                  <div className="flex justify-between items-start mb-6 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Khách hàng</p>
                      <p className="font-bold text-slate-800 text-base">{selectedContract?.tenantName || "N/A"}</p>
                      <p className="font-medium text-slate-700">Phòng {selectedContract?.roomNumber || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 mb-1">Hạn thanh toán</p>
                      <p className="font-bold text-slate-800">{s2.dueDate ? format(new Date(s2.dueDate), 'dd/MM/yyyy') : "N/A"}</p>
                    </div>
                  </div>

                  <table className="w-full text-sm text-left mb-6">
                    <thead className="border-y border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-2 font-semibold">SẢN PHẨM</th>
                        <th className="py-2 font-semibold text-center w-14">CŨ</th>
                        <th className="py-2 font-semibold text-center w-14">MỚI</th>
                        <th className="py-2 font-semibold text-center w-14">SL</th>
                        <th className="py-2 font-semibold text-right w-24">ĐƠN GIÁ</th>
                        <th className="py-2 font-semibold text-right w-28">THÀNH TIỀN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 border-b border-slate-200 text-slate-800">
                      {selectedContract?.rentalPrice > 0 && (
                        <tr>
                          <td className="py-3 font-medium text-slate-700">Tiền phòng</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center">1</td>
                          <td className="py-3 text-right">{new Intl.NumberFormat('vi-VN').format(selectedContract.rentalPrice)}</td>
                          <td className="py-3 text-right font-semibold">{new Intl.NumberFormat('vi-VN').format(selectedContract.rentalPrice)}</td>
                        </tr>
                      )}
                      {electricityUsage > 0 && (
                        <tr>
                          <td className="py-3 font-medium text-slate-700">Tiền điện</td>
                          <td className="py-3 text-center text-slate-500 text-xs bg-slate-50/50">{oldUtility?.electricityIndex || 0}</td>
                          <td className="py-3 text-center text-slate-500 text-xs bg-slate-50/50">{electricityIndexNew}</td>
                          <td className="py-3 text-center">{electricityUsage}</td>
                          <td className="py-3 text-right">{new Intl.NumberFormat('vi-VN').format(s2.electricityUnitPrice || 0)}</td>
                          <td className="py-3 text-right font-semibold">{new Intl.NumberFormat('vi-VN').format(electricityUsage * (Number(s2.electricityUnitPrice) || 0))}</td>
                        </tr>
                      )}
                      {waterUsage > 0 && (
                        <tr>
                          <td className="py-3 font-medium text-slate-700">Tiền nước</td>
                          <td className="py-3 text-center text-slate-500 text-xs bg-slate-50/50">{oldUtility?.waterIndex || 0}</td>
                          <td className="py-3 text-center text-slate-500 text-xs bg-slate-50/50">{waterIndexNew}</td>
                          <td className="py-3 text-center">{waterUsage}</td>
                          <td className="py-3 text-right">{new Intl.NumberFormat('vi-VN').format(s2.waterUnitPrice || 0)}</td>
                          <td className="py-3 text-right font-semibold">{new Intl.NumberFormat('vi-VN').format(waterUsage * (Number(s2.waterUnitPrice) || 0))}</td>
                        </tr>
                      )}
                      {Number(s2.internetUnitPrice) > 0 && (
                        <tr>
                          <td className="py-3 font-medium text-slate-700">Tiền Internet/Wifi</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center">{Number(s2.internetQuantity) || 1}</td>
                          <td className="py-3 text-right">{new Intl.NumberFormat('vi-VN').format(Number(s2.internetUnitPrice))}</td>
                          <td className="py-3 text-right font-semibold">{new Intl.NumberFormat('vi-VN').format((Number(s2.internetQuantity) || 1) * Number(s2.internetUnitPrice))}</td>
                        </tr>
                      )}
                      {Number(s2.serviceUnitPrice) > 0 && (
                        <tr>
                          <td className="py-3 font-medium text-slate-700">Phí dịch vụ chung</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center">{Number(s2.serviceQuantity) || 1}</td>
                          <td className="py-3 text-right">{new Intl.NumberFormat('vi-VN').format(Number(s2.serviceUnitPrice))}</td>
                          <td className="py-3 text-right font-semibold">{new Intl.NumberFormat('vi-VN').format((Number(s2.serviceQuantity) || 1) * Number(s2.serviceUnitPrice))}</td>
                        </tr>
                      )}
                      {Number(s2.cleaningUnitPrice) > 0 && (
                        <tr>
                          <td className="py-3 font-medium text-slate-700">Phí vệ sinh/rác</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center">{Number(s2.cleaningQuantity) || 1}</td>
                          <td className="py-3 text-right">{new Intl.NumberFormat('vi-VN').format(Number(s2.cleaningUnitPrice))}</td>
                          <td className="py-3 text-right font-semibold">{new Intl.NumberFormat('vi-VN').format((Number(s2.cleaningQuantity) || 1) * Number(s2.cleaningUnitPrice))}</td>
                        </tr>
                      )}
                      {Number(s2.parkingUnitPrice) > 0 && (
                        <tr>
                          <td className="py-3 font-medium text-slate-700">Phí gửi xe</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center">{Number(s2.parkingQuantity) || 0}</td>
                          <td className="py-3 text-right">{new Intl.NumberFormat('vi-VN').format(Number(s2.parkingUnitPrice))}</td>
                          <td className="py-3 text-right font-semibold">{new Intl.NumberFormat('vi-VN').format((Number(s2.parkingQuantity) || 0) * Number(s2.parkingUnitPrice))}</td>
                        </tr>
                      )}
                      {Number(s2.otherPrice) > 0 && (
                        <tr>
                          <td className="py-3 font-medium text-slate-700">Khác</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center text-slate-400 text-xs bg-slate-50/50">-</td>
                          <td className="py-3 text-center">-</td>
                          <td className="py-3 text-right">-</td>
                          <td className="py-3 text-right font-semibold">{new Intl.NumberFormat('vi-VN').format(Number(s2.otherPrice))}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="flex flex-col items-end space-y-2 text-sm mb-6">
                    <div className="flex justify-between w-full sm:w-64 text-slate-600">
                      <span>Tạm tính:</span>
                      <span className="font-semibold text-slate-800">{new Intl.NumberFormat('vi-VN').format(calcTotal() - Number(s2.debtFromPreviousMonth || 0) + Number(s2.discount || 0))} đ</span>
                    </div>
                    {Number(s2.debtFromPreviousMonth || 0) > 0 && (
                      <div className="flex justify-between w-full sm:w-64 text-slate-600">
                        <span>Nợ cũ:</span>
                        <span className="font-semibold text-red-600">+{new Intl.NumberFormat('vi-VN').format(Number(s2.debtFromPreviousMonth))} đ</span>
                      </div>
                    )}
                    {Number(s2.discount || 0) > 0 && (
                      <div className="flex justify-between w-full sm:w-64 text-slate-600">
                        <span>Giảm giá:</span>
                        <span className="font-semibold text-emerald-600">-{new Intl.NumberFormat('vi-VN').format(Number(s2.discount))} đ</span>
                      </div>
                    )}
                    <div className="flex justify-between w-full sm:w-64 pt-2 border-t border-slate-200 mt-2">
                      <span className="text-base font-bold text-slate-800">TỔNG TIỀN:</span>
                      <span className="text-xl font-extrabold text-blue-700">{new Intl.NumberFormat('vi-VN').format(calcTotal())} đ</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="w-48 h-48 bg-white rounded-lg border flex flex-col items-center justify-center p-1 shrink-0 overflow-hidden shadow-sm">
                      {selectedBank?.bankCode && selectedBank?.accountNumber ? (
                        <img 
                          src={`https://img.vietqr.io/image/${selectedBank.bankCode}-${selectedBank.accountNumber}-qr_only.png?amount=${calcTotal()}&addInfo=${encodeURIComponent(`Thanh toan tien nha P${selectedContract?.roomNumber}`)}&accountName=${encodeURIComponent(selectedBank.accountHolder || '')}`}
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
                        <span className="font-semibold text-slate-800">{selectedBank?.accountNumber || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500">Ngân hàng:</span>
                        <span className="font-semibold text-slate-800">{selectedBank?.bankName || 'N/A'} {selectedBank?.bankCode ? `(${selectedBank.bankCode})` : ''}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500">Tên tài khoản:</span>
                        <span className="font-semibold text-slate-800 uppercase">{selectedBank?.accountHolder || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500">Số tiền:</span>
                        <span className="font-semibold text-blue-700">{new Intl.NumberFormat('vi-VN').format(calcTotal())} đ</span>
                      </div>
                      <div className="flex">
                        <span className="w-24 text-slate-500">Nội dung:</span>
                        <span className="font-semibold text-slate-800">Thanh toan tien nha P{selectedContract?.roomNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 text-center italic mt-6 border-t border-dashed border-slate-300 pt-4">
                    Quý khách vui lòng thanh toán đúng hạn để đảm bảo quyền lợi thuê phòng.<br/>Xin cảm ơn!
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-all">
                      Quay lại sửa
                    </button>
                    <button type="button" onClick={handleDownloadPNG} disabled={isDownloading} className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-all">
                      {isDownloading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      <span className="hidden sm:inline">Tải ảnh (PNG)</span>
                    </button>
                  </div>
                  
                  <button onClick={onInvoiceSubmit} disabled={isSavingInvoice} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
                    {isSavingInvoice ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Xác nhận Phát hành</span>
                    </>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
