"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tenant } from "../types";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSuccess: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  tenant,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tenant) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/tenants/${tenant.id}`);
      toast.success("Đã xóa khách thuê thành công");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi xóa khách thuê:", error);
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra khi xóa");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận xóa khách thuê
          </DialogTitle>
          <DialogDescription className="pt-3 text-slate-600">
            Bạn có chắc chắn muốn xóa khách thuê <strong>{tenant?.fullName}</strong> không?
            <br />
            Hành động này không thể hoàn tác. Mọi dữ liệu liên quan có thể bị ảnh hưởng.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 sm:justify-end gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
