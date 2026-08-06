"use client";

import React, { useCallback, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  onRemove: () => void;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = "Tải ảnh lên",
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn định dạng ảnh hợp lệ");
        return;
      }

      // Check file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post("/upload", formData, {
          headers: {
            "Content-Type": undefined
          }
        });

        if (response.data?.imageUrl) {
          onChange(response.data.imageUrl);
          toast.success("Tải ảnh lên thành công");
        } else {
          throw new Error("Không nhận được URL ảnh từ server");
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.response?.data?.error || "Đã có lỗi xảy ra khi tải ảnh lên");
      } finally {
        setIsUploading(false);
        // Reset input value so the same file can be selected again
        event.target.value = "";
      }
    },
    [onChange]
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      
      {value ? (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 aspect-video md:aspect-square flex items-center justify-center bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={onRemove}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Xóa ảnh"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
              isUploading
                ? "border-slate-300 bg-slate-50 cursor-not-allowed"
                : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 bg-slate-50"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              ) : (
                <UploadCloud className="w-8 h-8 text-slate-400 mb-3" />
              )}
              <p className="mb-1 text-sm text-slate-500">
                {isUploading ? (
                  <span className="font-semibold text-blue-500">Đang tải lên...</span>
                ) : (
                  <>
                    <span className="font-semibold text-blue-600">Click để chọn ảnh</span> hoặc kéo thả vào đây
                  </>
                )}
              </p>
              <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
