import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GuestContent } from "./GuestContent";
import { Room } from "@/types/room";

async function getAvailableRooms(): Promise<Room[]> {
  try {
    // Note: process.env.NEXT_PUBLIC_API_URL should be available on the server side as well during build/runtime
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${apiUrl}/api/rooms/status/AVAILABLE`, {
      cache: "no-store", // We want fresh data for available rooms
    });
    
    if (!res.ok) {
      // Backend returned error (e.g., 404, 500)
      return [];
    }
    
    return await res.json();
  } catch (error) {
    // Backend is down or fetch failed
    return [];
  }
}

export default async function HomePage() {
  const rooms = await getAvailableRooms();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative selection:bg-blue-200">
      <header className="flex justify-between items-center p-4 lg:px-8 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            H
          </div>
          <span className="font-bold text-slate-800 text-lg hidden sm:block">HouseRental</span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:text-blue-600 font-medium rounded-xl">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button className="font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
              Đăng ký
            </Button>
          </Link>
        </div>
      </header>
      
      <GuestContent initialRooms={rooms} />
    </div>
  );
}
