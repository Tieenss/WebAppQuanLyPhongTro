"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Room } from "@/types/room";
import { RoomCard } from "@/components/rooms/RoomCard";
import { RoomImageDialog } from "@/components/rooms/RoomImageDialog";

interface GuestContentProps {
  initialRooms: Room[];
}

export function GuestContent({ initialRooms }: GuestContentProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredAreas = ["Tất cả", "Quận 1", "Quận Bình Thạnh", "Quận 7", "Thủ Đức"];

  // Giả lập lọc data (vì backend hiện chưa có filter theo khu vực trên API status, ta lọc trên FE)
  // Thực tế cần filter dựa vào property của Room (vd: address, buildingName).
  // Ở đây chúng ta filter tạm theo buildingName nếu nó chứa tên quận.
  const filteredRooms = initialRooms.filter((room) => {
    // Lọc theo Tab khu vực
    const matchTab = activeFilter === "Tất cả" || 
      (room.buildingName && room.buildingName.toLowerCase().includes(activeFilter.toLowerCase()));
      
    // Lọc theo từ khóa tìm kiếm (tên tòa nhà, địa chỉ, hoặc số phòng)
    const matchSearch = !searchQuery || 
      (room.buildingName && room.buildingName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room.roomNumber && room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room.address && room.address.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchTab && matchSearch;
  });

  return (
    <>
      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full relative px-4 py-20 sm:py-32 overflow-hidden flex justify-center">
          {/* Decorative background blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-40">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-10 w-64 h-64 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-6">
              ✨ Nền tảng tìm phòng trọ số 1
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6 leading-tight">
              Tìm phòng trọ nhanh, <br className="hidden sm:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400">
                sống an tâm hơn
              </span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              Khám phá không gian sống lý tưởng với thông tin minh bạch, rõ ràng và công cụ quản lý trọn gói trong một nền tảng.
            </p>

            <form 
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/40 bg-white/60 p-3 shadow-xl backdrop-blur-xl sm:flex-row transition-all hover:bg-white/80 duration-500"
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  aria-label="Khu vực tìm kiếm" 
                  className="pl-11 py-6 bg-white/80 border-slate-200 focus:border-blue-500 text-base rounded-xl" 
                  placeholder="Nhập khu vực, quận hoặc tên tòa nhà..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 rounded-xl text-base shadow-md">
                <Search className="h-5 w-5 mr-2" />
                Tìm phòng
              </Button>
            </form>
          </div>
        </section>

        {/* Featured Rooms Section */}
        <section className="w-full max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Phòng trống nổi bật</h2>
              <p className="text-slate-500">Những căn phòng tốt nhất đang chờ bạn khám phá</p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
              {featuredAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => setActiveFilter(area)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeFilter === area 
                      ? "bg-slate-900 text-white shadow-md" 
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  onViewNow={setSelectedRoom}
                />
              ))}
            </div>
          ) : (
            <div className="w-full bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy phòng</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Hiện tại không có phòng nào trống ở khu vực "{activeFilter}". Bạn hãy thử xem khu vực khác nhé.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-xl"
                onClick={() => setActiveFilter("Tất cả")}
              >
                Xem tất cả phòng
              </Button>
            </div>
          )}
        </section>
      </main>

      <RoomImageDialog 
        room={selectedRoom} 
        onClose={() => setSelectedRoom(null)} 
      />
    </>
  );
}
