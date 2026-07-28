"use client";

import { Bell, Search, Droplet, Zap, User } from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
  return (
    <div className="w-full min-h-screen bg-sky-50 pb-20 md:pb-8">
      {/* Phần Header */}
      <div className="bg-white rounded-b-[2.5rem] px-6 pt-12 md:pt-8 pb-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-primary overflow-hidden">
              {/* Ảnh đại diện giả lập */}
              <User size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Xin chào,</p>
              <h2 className="text-xl font-bold text-slate-800">Hi Tiênnss! 👋</h2>
            </div>
          </div>
          <button className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center text-slate-600">
            <Bell size={20} />
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm phòng, khách thuê..."
            className="w-full pl-11 pr-4 py-3.5 bg-sky-50/50 border border-slate-100 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
          />
        </div>
      </div>

      {/* Phần Thống kê */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-lg">Tổng quan tháng này</h3>
          <button className="text-primary text-sm font-semibold">Xem tất cả</button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Thống kê 1 */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full z-0" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-10 h-10 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-3">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Số điện tiêu thụ</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-slate-800">35.25</span>
                  <span className="text-xs text-slate-400">kWh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thống kê 2 */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-50 rounded-full z-0" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3">
                <Droplet size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Khối nước</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-slate-800">12.5</span>
                  <span className="text-xs text-slate-400">khối</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Doanh thu giả lập */}
          <div className="col-span-2 bg-gradient-to-br from-primary to-blue-400 p-6 rounded-3xl shadow-md text-white">
            <h4 className="text-blue-100 text-sm font-medium mb-1">Tổng doanh thu</h4>
            <div className="text-3xl font-bold mb-4">12,500,000 đ</div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white w-[75%] h-full rounded-full" />
            </div>
            <p className="text-xs text-blue-100 mt-2 text-right">Đã thu 75%</p>
          </div>
        </div>
      </div>

      {/* Phần Biểu đồ (Giả lập) */}
      <div className="px-6 mt-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Biểu đồ thống kê</h3>
          <div className="flex items-end justify-between h-40 pt-4 border-b border-slate-100 pb-2 relative">
            {/* Trục Y giả lập */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 pb-2">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>
            {/* Các cột */}
            {[40, 70, 45, 90, 65, 30].map((height, i) => (
              <div key={i} className="flex flex-col items-center w-8 ml-8">
                <div 
                  className="w-full bg-gradient-to-t from-primary to-purple-400 rounded-t-md"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-slate-500 mt-2">Th {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
