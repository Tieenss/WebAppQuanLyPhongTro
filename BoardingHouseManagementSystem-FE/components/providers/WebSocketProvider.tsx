"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";

interface WebSocketContextProps {
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  fetchNotifications: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/user/${session.user.id}`);
      const data = await res.json();
      const notis = data.data || data || [];
      setNotifications(notis);
      setUnreadCount(notis.filter((n: any) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = new SockJS("http://localhost:8080/ws-chat");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket");
        // Subscribe to user-specific channel
        client.subscribe(`/topic/user/${session.user.id}/notifications`, (message: IMessage) => {
          if (message.body) {
            const notification = JSON.parse(message.body);
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
            // Show toast
            toast(notification.title || "Thông báo mới", {
              description: notification.content || notification.message,
            });
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [session?.user?.id]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = () => {
    notifications.filter(n => !n.isRead).forEach(n => markAsRead(n.id));
  };

  return (
    <WebSocketContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </WebSocketContext.Provider>
  );
};
