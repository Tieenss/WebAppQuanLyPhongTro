"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";

interface WebSocketContextProps {
  notifications: any[];
  unreadCount: number;
  markAsRead: () => void;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket");
        // Subscribe to user-specific channel
        client.subscribe(`/user/${session.user.id}/queue/notifications`, (message: IMessage) => {
          if (message.body) {
            const notification = JSON.parse(message.body);
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
            // Show toast
            toast(notification.title || "Thông báo mới", {
              description: notification.message,
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

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <WebSocketContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </WebSocketContext.Provider>
  );
};
