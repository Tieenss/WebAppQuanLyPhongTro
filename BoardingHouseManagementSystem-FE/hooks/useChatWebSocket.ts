import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  messageText: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export function useChatWebSocket(token: string | null) {
  const [client, setClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  
  // Lưu trữ tin nhắn theo conversationId
  const [messagesByConversation, setMessagesByConversation] = useState<Record<number, ChatMessage[]>>({});

  useEffect(() => {
    if (!token) return;

    let isActive = true;
    let stompClient: Client | null = null;

    const initWebSocket = async () => {
      const SockJS = (await import('sockjs-client')).default;
      if (!isActive) return;

      const socket = new SockJS('http://localhost:8080/ws-chat'); // Update this with your actual backend URL

      stompClient = new Client({
        webSocketFactory: () => socket as any,
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          // console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      stompClient.onConnect = (frame) => {
        setConnected(true);
        console.log('Connected to WebSocket:', frame);
      };

      stompClient.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      };

      stompClient.activate();
      setClient(stompClient);
    };

    initWebSocket();

    return () => {
      isActive = false;
      if (stompClient) stompClient.deactivate();
    };
  }, [token]);

  const subscribeToConversation = useCallback((conversationId: number) => {
    if (!client || !client.connected) return;

    return client.subscribe(`/topic/chat/${conversationId}`, (message) => {
      if (message.body) {
        const newMessage: ChatMessage = JSON.parse(message.body);
        setMessagesByConversation(prev => {
          const prevMessages = prev[conversationId] || [];
          // Avoid duplicate messages
          if (prevMessages.some(m => m.id === newMessage.id)) return prev;
          return {
            ...prev,
            [conversationId]: [...prevMessages, newMessage]
          };
        });
      }
    });
  }, [client]);

  const sendMessage = useCallback((conversationId: number, senderId: number, text: string, imageUrl?: string) => {
    if (client && client.connected) {
      client.publish({
        destination: `/app/chat/${conversationId}`,
        body: JSON.stringify({
          conversationId,
          senderId,
          messageText: text,
          imageUrl
        })
      });
    }
  }, [client]);

  // Load initial messages from REST API
  const loadInitialMessages = useCallback(async (conversationId: number, token: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/chat/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const msgs = await res.json();
        setMessagesByConversation(prev => ({
          ...prev,
          [conversationId]: msgs
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return {
    connected,
    messagesByConversation,
    subscribeToConversation,
    sendMessage,
    loadInitialMessages
  };
}
