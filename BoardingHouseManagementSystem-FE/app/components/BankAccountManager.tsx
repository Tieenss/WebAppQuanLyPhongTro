"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { CreditCard, Plus, Trash2, Edit2, CheckCircle2 } from "lucide-react";

export default function BankAccountManager() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ id: null, bankName: "", bankCode: "", accountNumber: "", accountHolder: "", isDefault: false });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          onClick={() => { setFormData({ id: null, bankName: "", bankCode: "", accountNumber: "", accountHolder: "", isDefault: accounts.length === 0 }); setIsAdding(true); }}
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
              <button type="button" onClick={() => { setFormData(acc); setIsAdding(true); }} className="p-2 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit2 className="w-4 h-4"/></button>
              <button type="button" onClick={() => handleDelete(acc.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && !isAdding && (
          <p className="text-sm text-slate-500 text-center py-4">Chưa có tài khoản ngân hàng nào. Vui lòng thêm để sử dụng VietQR.</p>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <h3 className="font-semibold text-slate-700 mb-2">{formData.id ? 'Sửa' : 'Thêm'} Tài khoản</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tên Ngân hàng</label>
            <input type="text" required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" placeholder="VD: Ngân hàng TMCP Quân đội" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mã Ngân hàng (Short Name)</label>
            <input type="text" required value={formData.bankCode} onChange={e => setFormData({...formData, bankCode: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 uppercase" placeholder="VD: MB, VCB, TCB, BIDV..." />
            <p className="text-[10px] text-slate-500 mt-1">Bắt buộc nhập đúng mã (ví dụ: MB, VCB) để tạo QR</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Số Tài khoản</label>
            <input type="text" required value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Chủ Tài khoản</label>
            <input type="text" required value={formData.accountHolder} onChange={e => setFormData({...formData, accountHolder: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 uppercase" />
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">Hủy</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium">Lưu tài khoản</button>
          </div>
        </form>
      )}
    </section>
  );
}
