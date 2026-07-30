"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { Tenant } from "../types";

interface QuickContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSuccess: () => void;
}

export function QuickContractModal({ isOpen, onClose, tenant, onSuccess }: QuickContractModalProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    roomId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    deposit: "1000000",
    rentalPrice: "2500000",
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmptyRooms();
    }
  }, [isOpen]);

  const fetchEmptyRooms = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/rooms");
      const data = res.data?.data || res.data || [];
      // Only keep available rooms
      const available = Array.isArray(data) ? data.filter((r: any) => {
        const s = r.status?.toLowerCase();
        return s === "available" || s === "trong" || s === "trống";
      }) : [];
      setRooms(available);
      if (available.length > 0) {
        setFormData(prev => ({ ...prev, roomId: available[0].id.toString(), rentalPrice: available[0].price.toString() }));
      }
    } catch (error) {
      toast.error("Không thể tải danh sách phòng trống");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value;
    const room = rooms.find(r => r.id.toString() === roomId);
    setFormData(prev => ({
      ...prev,
      roomId,
      rentalPrice: room ? room.price.toString() : prev.rentalPrice
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !formData.roomId) {
      toast.error("Vui lòng chọn phòng");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        roomId: parseInt(formData.roomId),
        tenantId: tenant.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        deposit: parseFloat(formData.deposit),
        rentalPrice: parseFloat(formData.rentalPrice),
        status: "active"
      };

      await apiClient.post("/contracts", payload);
      toast.success("Tạo hợp đồng thành công");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi tạo hợp đồng:", error);
      toast.error(error.response?.data?.message || "Không thể tạo hợp đồng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Tạo Hợp Đồng Nhanh
          </DialogTitle>
          <div className="text-sm text-slate-500 mt-1">
            Khách thuê: <span className="font-semibold text-slate-800">{tenant?.fullName}</span>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-slate-500">Đang tải phòng trống...</div>
        ) : rooms.length === 0 ? (
          <div className="py-8 text-center text-amber-600 bg-amber-50 rounded-lg">
            Không có phòng trống nào! Vui lòng thêm phòng mới trước.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Chọn phòng trống</Label>
              <select
                id="roomId"
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.roomId}
                onChange={handleRoomChange}
                required
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name || `Phòng ${room.roomNumber}`} - {room.price.toLocaleString()}đ</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deposit">Tiền cọc (VNĐ)</Label>
                <Input 
                  id="deposit" 
                  type="number" 
                  value={formData.deposit}
                  onChange={e => setFormData({...formData, deposit: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalPrice">Tiền phòng (VNĐ)</Label>
                <Input 
                  id="rentalPrice" 
                  type="number" 
                  value={formData.rentalPrice}
                  onChange={e => setFormData({...formData, rentalPrice: e.target.value})}
                  required 
                />
              </div>
            </div>

            <DialogFooter className="pt-4 mt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Bỏ qua
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSubmitting ? "Đang lưu..." : "Tạo hợp đồng"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
