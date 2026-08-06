"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

export interface Notification {
  id: number;
  title: string;
  content: string;
  senderName: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await apiClient.get(`/notifications/user/${session.user.id}`);
      const data = res.data?.data || res.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    let apiUrl = "http://localhost:8080";
    if (process.env.NEXT_PUBLIC_API_URL) {
       apiUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
    }
    
    const socket = new SockJS(`${apiUrl}/ws-chat`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        // console.log(str);
      },
      onConnect: () => {
        stompClient.subscribe(`/topic/user/${session.user.id}/notifications`, (message) => {
          if (message.body) {
            const noti: Notification = JSON.parse(message.body);
            setNotifications((prev) => [noti, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast.info(noti.title, { description: noti.content });
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [session?.user?.id]);

  const markAsRead = async (id: number) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = () => {
    notifications.filter(n => !n.isRead).forEach(n => markAsRead(n.id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
