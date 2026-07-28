"use client";

import Image from "next/image";
import { Room } from "@/types/room";
import { MapPin, Expand, Users, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoomCardProps {
  room: Room;
  onViewNow: (room: Room) => void;
}

export function RoomCard({ room, onViewNow }: RoomCardProps) {
  // Use first image if available, otherwise fallback
  const displayImage = room.imageUrls && room.imageUrls.length > 0 
    ? room.imageUrls[0] 
    : null;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 flex items-center justify-center">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={`Phòng ${room.roomNumber}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <ImageIcon size={48} className="mb-2 opacity-50" />
            <span className="text-sm">Chưa có ảnh</span>
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          {room.status === "available" && (
            <Badge variant="success" className="shadow-sm">Đang trống</Badge>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Phòng {room.roomNumber}</h3>
            <div className="flex items-center text-slate-500 text-sm mt-1">
              <MapPin size={14} className="mr-1" />
              <span>{room.buildingName}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-blue-600">
              {new Intl.NumberFormat("vi-VN").format(room.price)}đ
            </p>
            <p className="text-xs text-slate-500">/tháng</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 my-4 py-4 border-y border-slate-50">
          <div className="flex items-center text-sm text-slate-600">
            <Expand size={16} className="mr-2 text-slate-400" />
            <span>{room.area} m²</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Users size={16} className="mr-2 text-slate-400" />
            <span>Tối đa {room.maxOccupants} người</span>
          </div>
        </div>

        <Button 
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-6"
          onClick={() => onViewNow(room)}
        >
          Xem ngay
        </Button>
      </div>
    </div>
  );
}
