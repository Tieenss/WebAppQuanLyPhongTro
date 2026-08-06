"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

type ModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function CreateTenantModal({ isOpen, onOpenChange, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    cccdNumber: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [cccdFront, setCccdFront] = useState<File | null>(null);
  const [cccdBack, setCccdBack] = useState<File | null>(null);

  const uploadFile = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    const res = await apiClient.post("/upload", data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Số điện thoại phải có đúng 10 chữ số");
      return;
    }

    if (formData.cccdNumber && !/^\d{10,12}$/.test(formData.cccdNumber)) {
      toast.error("CCCD/CMND phải có từ 10 đến 12 chữ số");
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = "";
      let cccdFrontImg = "";
      let cccdBackImg = "";

      if (avatar) avatarUrl = await uploadFile(avatar);
      if (cccdFront) cccdFrontImg = await uploadFile(cccdFront);
      if (cccdBack) cccdBackImg = await uploadFile(cccdBack);

      const payload = {
        ...formData,
        avatarUrl,
        cccdFrontImg,
        cccdBackImg
      };

      await apiClient.post("/tenants", payload);
      toast.success("Đã thêm khách thuê thành công");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({ fullName: "", phone: "", email: "", cccdNumber: "" });
      setAvatar(null);
      setCccdFront(null);
      setCccdBack(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm khách thuê.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <Dialog.Title className="text-xl font-bold text-slate-800">Thêm Khách Thuê Mới</Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-2 hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
              <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại *</label>
                <input required type="tel" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số CCCD / CMND *</label>
              <input required type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={formData.cccdNumber} onChange={e => setFormData({...formData, cccdNumber: e.target.value})} />
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-sm text-slate-700">Hình ảnh giấy tờ (Tùy chọn)</h3>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mặt trước CCCD</label>
                <input type="file" accept="image/*" onChange={e => setCccdFront(e.target.files?.[0] || null)} className="w-full text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mặt sau CCCD</label>
                <input type="file" accept="image/*" onChange={e => setCccdBack(e.target.files?.[0] || null)} className="w-full text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ảnh chân dung</label>
                <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files?.[0] || null)} className="w-full text-xs" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={loading} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50">
                {loading ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <span>Lưu Khách thuê</span>}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
