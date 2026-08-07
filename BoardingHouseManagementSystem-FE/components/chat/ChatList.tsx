"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Users } from "lucide-react";
import { ConversationInfo } from "./ChatWidget";
import { useSession } from "next-auth/react";
import CreateChatDialog from "./CreateChatDialog";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";

interface Props {
  activeConversation: ConversationInfo | null;
  onSelectConversation: (conv: ConversationInfo) => void;
  refreshTrigger?: number;
}

export default function ChatList({ activeConversation, onSelectConversation, refreshTrigger = 0 }: Props) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [search, setSearch] = useState("");
  const token = (session as any)?.accessToken;
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  
  const { connected, subscribeToConversation, messagesByConversation } = useChatWebSocket(token);

  const loadConversations = useCallback(async () => {
    if (!token || !userId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/chat/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  }, [token, userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, refreshTrigger]);

  // Subscribe to all conversations to receive real-time notifications
  useEffect(() => {
    if (connected && conversations.length > 0) {
      conversations.forEach(c => subscribeToConversation(c.id));
    }
  }, [connected, conversations.length, subscribeToConversation]);

  // Get display message taking realtime messages into account
  const getDisplayMessage = (conv: ConversationInfo) => {
    const msgs = messagesByConversation[conv.id];
    if (msgs && msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1];
      return lastMsg.messageText || (lastMsg.imageUrl ? "[Hình ảnh]" : "");
    }
    return conv.lastMessage;
  };

  // Check if we have unread real-time messages
  const hasNewUnreadMessage = (convId: number) => {
    if (activeConversation?.id === convId) return false;
    const msgs = messagesByConversation[convId];
    if (msgs && msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1];
      // If we received a message from someone else while not in this chat
      return lastMsg.senderId !== Number(userId);
    }
    return false;
  };

  const handleChatCreated = (newConv: ConversationInfo) => {
    setConversations(prev => [newConv, ...prev.filter(c => c.id !== newConv.id)]);
    onSelectConversation(newConv);
  };

  const filtered = conversations.filter(c => c.chatName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search & Actions */}
      <div className="p-3 border-b border-gray-100 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        {role === "LANDLORD" && token && (
          <CreateChatDialog onChatCreated={handleChatCreated} token={token} />
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-4 px-4">
            Không tìm thấy cuộc trò chuyện nào
          </div>
        ) : (
          filtered.map(conv => {
            const displayMessage = getDisplayMessage(conv);
            const unreadTotal = conv.unreadCount + (hasNewUnreadMessage(conv.id) ? 1 : 0);
            const hasUnread = unreadTotal > 0 && activeConversation?.id !== conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv);
                  // Reset local unread simulation on click by forcing a refetch or local update
                  setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  activeConversation?.id === conv.id
                    ? "bg-indigo-50 border-r-2 border-indigo-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="w-12 h-12 rounded-full flex-shrink-0 bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm relative">
                  {conv.chatImage ? (
                    <img src={conv.chatImage} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  ) : conv.isGroupChat ? (
                    <Users size={24} />
                  ) : (
                    <span className="font-bold text-lg">{conv.chatName?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`text-sm truncate pr-2 ${hasUnread ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                      {conv.chatName}
                    </h4>
                    {hasUnread && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {unreadTotal}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${hasUnread ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                    {displayMessage}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
