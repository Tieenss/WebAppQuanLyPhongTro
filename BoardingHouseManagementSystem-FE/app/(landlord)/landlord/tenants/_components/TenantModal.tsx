"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tenant, TenantRequest } from "../types";
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
import { ImageUpload } from "./ImageUpload";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";

const tenantSchema = z.object({
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^\d{10}$/, "Số điện thoại phải có đúng 10 chữ số"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")),
  avatarUrl: z.string().nullable(),
  cccdNumber: z.string().regex(/^\d{10,12}$/, "CCCD/CMND phải có từ 10 đến 12 chữ số").nullable().or(z.literal("")),
  cccdFrontImg: z.string().nullable(),
  cccdBackImg: z.string().nullable(),
  isActive: z.boolean(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSuccess: (savedTenant?: Tenant, openContract?: boolean) => void;
}

export function TenantModal({ isOpen, onClose, tenant, onSuccess }: TenantModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"save" | "save_and_contract">("save");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      avatarUrl: null,
      cccdNumber: "",
      cccdFrontImg: null,
      cccdBackImg: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (tenant) {
      reset({
        fullName: tenant.fullName,
        phone: tenant.phone,
        email: tenant.email || "",
        avatarUrl: tenant.avatarUrl,
        cccdNumber: tenant.cccdNumber || "",
        cccdFrontImg: tenant.cccdFrontImg,
        cccdBackImg: tenant.cccdBackImg,
        isActive: tenant.isActive !== false,
      });
    } else {
      reset({
        fullName: "",
        phone: "",
        email: "",
        avatarUrl: null,
        cccdNumber: "",
        cccdFrontImg: null,
        cccdBackImg: null,
        isActive: true,
      });
    }
  }, [tenant, reset, isOpen]);

  const onSubmit = async (data: TenantFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: TenantRequest = {
        ...data,
        email: data.email || null,
        cccdNumber: data.cccdNumber || "", // Use empty string to prevent DB null constraint violation
      };

      let savedTenantData = tenant;
      if (tenant) {
        const res = await apiClient.put(`/tenants/${tenant.id}`, payload);
        savedTenantData = res.data;
        toast.success("Cập nhật thông tin khách thuê thành công");
      } else {
        const res = await apiClient.post("/tenants", payload);
        savedTenantData = res.data;
        toast.success("Thêm khách thuê thành công");
      }
      onSuccess(savedTenantData || undefined, submitAction === "save_and_contract");
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi lưu khách thuê:", error);
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            {tenant ? "Chỉnh sửa Khách thuê" : "Thêm Khách thuê mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Thông tin liên hệ</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
                <Input id="fullName" {...register("fullName")} placeholder="Nguyễn Văn A" />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                <Input id="phone" {...register("phone")} placeholder="0987654321" />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="nguyenvana@gmail.com" />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-700">Đang thuê phòng (Active)</span>
                    </label>
                  )}
                />
              </div>

              <div className="pt-2">
                <Controller
                  name="avatarUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      label="Ảnh đại diện (Avatar)"
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange(null)}
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Thông tin giấy tờ (CCCD)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="cccdNumber">Số CMND/CCCD</Label>
                <Input id="cccdNumber" {...register("cccdNumber")} placeholder="0123456789" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="cccdFrontImg"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      label="Mặt trước CCCD"
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange(null)}
                    />
                  )}
                />
                
                <Controller
                  name="cccdBackImg"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      label="Mặt sau CCCD"
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange(null)}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setSubmitAction("save_and_contract")}
            >
              Lưu & Tạo hợp đồng
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setSubmitAction("save")}
            >
              {isSubmitting ? "Đang lưu..." : tenant ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
