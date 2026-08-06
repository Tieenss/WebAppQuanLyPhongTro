"use client";

import React, { useState, useEffect, useRef } from "react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, Edit2, CheckCircle2, ChevronDown, Check } from "lucide-react";

const POPULAR_BANKS = [
  { name: 'Vietcombank', code: 'VCB', logo: 'https://cdn.vietqr.io/img/VCB.png' },
  { name: 'VietinBank', code: 'CTG', logo: 'https://cdn.vietqr.io/img/ICB.png' },
  { name: 'BIDV', code: 'BIDV', logo: 'https://cdn.vietqr.io/img/BIDV.png' },
  { name: 'Agribank', code: 'VBA', logo: 'https://cdn.vietqr.io/img/VBA.png' },
  { name: 'MBBank', code: 'MB', logo: 'https://cdn.vietqr.io/img/MB.png' },
  { name: 'Techcombank', code: 'TCB', logo: 'https://cdn.vietqr.io/img/TCB.png' },
  { name: 'ACB', code: 'ACB', logo: 'https://cdn.vietqr.io/img/ACB.png' },
  { name: 'VPBank', code: 'VPB', logo: 'https://cdn.vietqr.io/img/VPB.png' },
  { name: 'TPBank', code: 'TPB', logo: 'https://cdn.vietqr.io/img/TPB.png' },
  { name: 'Sacombank', code: 'STB', logo: 'https://cdn.vietqr.io/img/STB.png' },
  { name: 'HDBank', code: 'HDB', logo: 'https://cdn.vietqr.io/img/HDB.png' },
  { name: 'VIB', code: 'VIB', logo: 'https://cdn.vietqr.io/img/VIB.png' },
  { name: 'SHB', code: 'SHB', logo: 'https://cdn.vietqr.io/img/SHB.png' },
  { name: 'OCB', code: 'OCB', logo: 'https://cdn.vietqr.io/img/OCB.png' },
  { name: 'MSB', code: 'MSB', logo: 'https://cdn.vietqr.io/img/MSB.png' },
];

export default function BankAccountManager() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isCustomBank, setIsCustomBank] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, bankName: "", bankCode: "", accountNumber: "", accountHolder: "", isDefault: false });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await apiClient.get("/bank-accounts");
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      setAccounts(data || []);
    } catch (error) {
      console.error("Failed to fetch bank accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!formData.bankName || !formData.bankCode || !formData.accountNumber || !formData.accountHolder) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      if (formData.id) {
        await apiClient.put(`/bank-accounts/${formData.id}`, formData);
        toast.success("Cập nhật tài khoản thành công");
      } else {
        await apiClient.post("/bank-accounts", formData);
        toast.success("Thêm tài khoản thành công");
      }
      setIsAdding(false);
      fetchAccounts();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    try {
      await apiClient.delete(`/bank-accounts/${id}`);
      toast.success("Đã xóa tài khoản");
      fetchAccounts();
    } catch (error) {
      toast.error("Không thể xóa tài khoản");
    }
  };

  const handleSetDefault = async (acc: any) => {
    try {
      await apiClient.put(`/bank-accounts/${acc.id}`, { ...acc, isDefault: true });
      toast.success("Đã đặt làm mặc định");
      fetchAccounts();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  if (loading) return <div>Đang tải thông tin ngân hàng...</div>;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-500" />
          Danh sách Tài khoản Ngân hàng (VietQR)
        </h2>
        <button 
          type="button" 
          onClick={() => { 
            setFormData({ id: null, bankName: "", bankCode: "", accountNumber: "", accountHolder: "", isDefault: accounts.length === 0 }); 
            setIsAdding(true); 
            setIsCustomBank(false);
          }}
          className="text-sm bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm tài khoản
        </button>
      </div>

      <div className="space-y-4">
        {accounts.map(acc => (
          <div key={acc.id} className={`p-4 rounded-xl border flex items-start justify-between ${acc.isDefault ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-800">{acc.bankName} {acc.bankCode ? `(${acc.bankCode})` : ''}</span>
                {acc.isDefault && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Mặc định</span>}
              </div>
              <p className="text-sm text-slate-600">STK: <span className="font-mono font-semibold text-slate-800">{acc.accountNumber}</span></p>
              <p className="text-sm text-slate-600">Chủ TK: <span className="uppercase font-semibold">{acc.accountHolder}</span></p>
            </div>
            <div className="flex items-center gap-2">
              {!acc.isDefault && (
                <button type="button" onClick={() => handleSetDefault(acc)} className="text-xs text-blue-600 hover:underline">
                  Đặt mặc định
                </button>
              )}
              <button type="button" onClick={() => { 
                setFormData(acc); 
                setIsAdding(true); 
                setIsCustomBank(!POPULAR_BANKS.some(b => b.code === acc.bankCode));
              }} className="p-2 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 className="w-4 h-4"/></button>
              <button type="button" onClick={() => handleDelete(acc.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && !isAdding && (
          <p className="text-sm text-slate-500 text-center py-4">Chưa có tài khoản ngân hàng nào. Vui lòng thêm để sử dụng VietQR.</p>
        )}
      </div>

      {isAdding && (
        <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <h3 className="font-semibold text-slate-700 mb-2">{formData.id ? 'Sửa' : 'Thêm'} Tài khoản</h3>
          </div>
          <div className="md:col-span-2 relative bank-dropdown" ref={dropdownRef}>
            <label className="block text-xs font-medium text-slate-700 mb-1">Ngân hàng</label>
            <button 
              type="button" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm bg-white hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isCustomBank ? (
                  <span className="font-medium text-slate-800">Khác (Nhập tay)</span>
                ) : formData.bankCode ? (
                  <>
                    <img src={POPULAR_BANKS.find(b => b.code === formData.bankCode)?.logo} alt="logo" className="w-6 h-6 object-contain rounded-full border border-slate-100 bg-white" />
                    <span className="font-medium text-slate-800">{POPULAR_BANKS.find(b => b.code === formData.bankCode)?.name}</span>
                  </>
                ) : (
                  <span className="text-slate-500">Chọn ngân hàng...</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
                <div className="p-1">
                  {POPULAR_BANKS.map(b => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => {
                        setIsCustomBank(false);
                        setFormData({ ...formData, bankName: b.name, bankCode: b.code });
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 transition-colors rounded-lg ${formData.bankCode === b.code && !isCustomBank ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={b.logo} alt={b.name} className="w-8 h-8 object-contain rounded-full border border-slate-200 bg-white shadow-sm" />
                        <div className="text-left">
                          <p className="font-semibold">{b.name}</p>
                          <p className="text-[10px] text-slate-500">{b.code}</p>
                        </div>
                      </div>
                      {formData.bankCode === b.code && !isCustomBank && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomBank(true);
                      setFormData({ ...formData, bankName: "", bankCode: "" });
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 transition-colors rounded-lg ${isCustomBank ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700'}`}
                  >
                    <span className="font-semibold">Khác (Nhập tay)</span>
                    {isCustomBank && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          {isCustomBank && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên Ngân hàng</label>
                <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="VD: Ngân hàng TMCP Quân đội" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mã Ngân hàng (Short Name)</label>
                <input type="text" value={formData.bankCode} onChange={e => setFormData({...formData, bankCode: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 uppercase" placeholder="VD: MB, VCB, TCB, BIDV..." />
                <p className="text-[10px] text-slate-500 mt-1">Bắt buộc nhập đúng mã (ví dụ: MB, VCB) để tạo QR</p>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Số Tài khoản</label>
            <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Chủ Tài khoản</label>
            <input type="text" value={formData.accountHolder} onChange={e => setFormData({...formData, accountHolder: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 uppercase" />
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">Hủy</button>
            <button type="button" onClick={handleSubmit} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium">Lưu tài khoản</button>
          </div>
        </div>
      )}
    </section>
  );
}
