"use client";

import Image from "next/image";
import { X, ImageIcon, Expand, Users, CheckCircle2 } from "lucide-react";
import { Room } from "@/types/room";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface RoomImageDialogProps {
  room: Room | null;
  onClose: () => void;
}

export function RoomImageDialog({ room, onClose }: RoomImageDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (room) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [room]);

  if (!mounted || !room) return null;

  const displayImage = room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls[0] : null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-slate-900 rounded-full shadow-md backdrop-blur-md transition-all"
        >
          <X size={20} />
        </button>
        
        <div className="w-full aspect-video bg-slate-100 flex flex-col items-center justify-center relative">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={`Phòng ${room.roomNumber}`}
              fill
              className="object-contain bg-slate-900"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <ImageIcon size={64} className="mb-4 opacity-50" />
              <span className="text-lg">Hiện chưa có ảnh cho phòng này</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Phòng {room.roomNumber} - {room.buildingName}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Diện tích</p>
              <p className="font-semibold text-slate-900 flex items-center">
                <Expand size={16} className="mr-2 text-blue-500" />
                {room.area} m²
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Tối đa</p>
              <p className="font-semibold text-slate-900 flex items-center">
                <Users size={16} className="mr-2 text-blue-500" />
                {room.maxOccupants} người
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wider">Mô tả chi tiết</h3>
            <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed">
              {room.description || "Chưa có mô tả chi tiết."}
            </p>
          </div>
          
          {room.amenities && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wider">Tiện ích</h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities.split(',').map((amenity, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    <CheckCircle2 size={14} className="mr-1.5" />
                    {amenity.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <p className="text-3xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN").format(room.price)}đ<span className="text-base text-slate-500 font-normal">/tháng</span>
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-xl transition-colors"
            >
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
