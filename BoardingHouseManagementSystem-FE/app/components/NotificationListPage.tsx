"use client";

import React from "react";
import { useWebSocket } from "@/components/providers/WebSocketProvider";
import { Bell, CheckCircle } from "lucide-react";

export default function NotificationListPage() {
  const { notifications, markAsRead, markAllAsRead } = useWebSocket();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-500" />
            Thông báo của bạn
          </h1>
          <p className="text-slate-500 mt-1">Xem tất cả các thông báo từ hệ thống</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">Không có thông báo nào</h3>
            <p className="text-slate-500 mt-1">Bạn đã xem hết tất cả thông báo</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((noti) => (
              <li
                key={noti.id}
                className={`p-5 transition-colors flex gap-4 ${
                  !noti.isRead ? "bg-blue-50/30" : "hover:bg-slate-50"
                }`}
              >
                <div className="shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!noti.isRead ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-base ${!noti.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-800"}`}>
                      {noti.title}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(noti.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    {noti.content || noti.message}
                  </p>
                  
                  {!noti.isRead && (
                    <button
                      onClick={() => markAsRead(noti.id)}
                      className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
                {!noti.isRead && (
                  <div className="flex items-center justify-center px-2">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
