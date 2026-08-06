"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications, Notification } from "@/app/contexts/NotificationContext";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (noti: Notification) => {
    if (!noti.isRead) {
      markAsRead(noti.id);
    }
    // Optional: navigate to specific page based on noti type/content
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Không có thông báo nào
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((noti) => (
                  <li 
                    key={noti.id} 
                    className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!noti.isRead ? 'bg-blue-50/50' : ''}`}
                    onClick={() => handleNotificationClick(noti)}
                  >
                    <div className="flex gap-3">
                      {!noti.isRead && (
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                      <div className={noti.isRead ? "pl-0" : ""}>
                        <p className={`text-sm ${!noti.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>
                          {noti.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                          {noti.content}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(noti.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
