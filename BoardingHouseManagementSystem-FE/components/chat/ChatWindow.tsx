"use client";

import { useState, useRef, useEffect } from "react";
import { ConversationInfo } from "./ChatWidget";
import { ArrowLeft, Image as ImageIcon, Send, Smile, Info, Users, Loader2, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import ImageViewer from "./ImageViewer";
import ChatInfoPanel from "./ChatInfoPanel";
import { processImageBeforeUpload } from "../../lib/imageUtils";

interface Props {
  conversation: ConversationInfo;
  onBack: () => void;
  onAvatarUpdated?: (newImageUrl: string) => void;
}

export default function ChatWindow({ conversation, onBack, onAvatarUpdated }: Props) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = (session as any)?.accessToken || null; 
  const userId = Number((session?.user as any)?.id) || 1; 
  const userRole = (session?.user as any)?.role || "";
  
  const [isUploading, setIsUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { connected, messagesByConversation, subscribeToConversation, sendMessage, loadInitialMessages } = useChatWebSocket(token);

  useEffect(() => {
    if (token && connected) {
      subscribeToConversation(conversation.id);
      loadInitialMessages(conversation.id, token);
      
      // Đánh dấu đã đọc
      fetch(`http://localhost:8080/api/chat/${conversation.id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(e => console.error("Error marking as read", e));
    }
  }, [conversation.id, token, connected, subscribeToConversation, loadInitialMessages]);

  const messages = messagesByConversation[conversation.id] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(conversation.id, userId, text);
    setText("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    
    try {
      const processedFile = await processImageBeforeUpload(file);
      
      const formData = new FormData();
      formData.append("file", processedFile);

      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          // Gửi tin nhắn chứa ảnh qua WebSocket
          sendMessage(conversation.id, userId, "", data.imageUrl);
        }
      } else {
        console.error("Lỗi upload ảnh");
      }
    } catch (error) {
      console.error("Lỗi mạng khi upload", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Show button if scrolled up more than 100px from bottom
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollButton(isScrolledUp);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-gray-500 p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden shrink-0">
            {conversation.chatImage ? (
               <img src={conversation.chatImage} alt="avatar" className="w-full h-full object-cover" />
            ) : conversation.isGroupChat ? (
               <Users size={20} />
            ) : (
               <span className="font-semibold">{conversation.chatName?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{conversation.chatName}</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Đang hoạt động
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500 shrink-0">
          <button 
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`p-2 rounded-full transition-colors ${showInfoPanel ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100"}`}
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.map((msg, i) => {
          const isMine = msg.senderId === userId;
          return (
            <div key={msg.id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              {!isMine && conversation.isGroupChat && (
                <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600 mt-auto">
                  {msg.senderName?.charAt(0)}
                </div>
              )}
              <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                {!isMine && conversation.isGroupChat && (
                  <span className="text-xs text-gray-500 ml-1 mb-1">{msg.senderName}</span>
                )}
                <div 
                  className={`px-4 py-2 rounded-2xl ${
                    isMine 
                      ? "bg-indigo-600 text-white rounded-br-none" 
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                  } shadow-sm`}
                >
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="attachment" 
                      className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
                      onClick={() => setViewingImage(msg.imageUrl!)}
                    />
                  )}
                  {msg.messageText && <p className="whitespace-pre-wrap break-words">{msg.messageText}</p>}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 mx-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {isUploading && (
          <div className="flex justify-end">
            <div className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-2xl rounded-br-none shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Đang gửi ảnh...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-[80px] right-1/2 translate-x-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-500 hover:text-indigo-600 p-2 rounded-full shadow-md z-20 transition-all hover:scale-110"
        >
          <ChevronDown size={20} />
        </button>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200 z-10 shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50 shrink-0"
          >
            <ImageIcon size={22} />
          </button>
          
          <div className="flex-1 bg-gray-100 rounded-2xl flex items-end border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="w-full bg-transparent p-3 max-h-32 focus:outline-none resize-none"
              rows={1}
              style={{ minHeight: "44px" }}
            />
            <button type="button" className="p-3 text-gray-400 hover:text-indigo-600 shrink-0">
              <Smile size={20} />
            </button>
          </div>

          <button
            type="submit"
            disabled={(!text.trim() && !isUploading) || isUploading}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
          >
            <Send size={20} className={text.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
          </button>
        </form>
      </div>

      {/* Modals & Panels */}
      {viewingImage && (
        <ImageViewer imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
      )}
      
      {showInfoPanel && token && (
        <ChatInfoPanel 
          conversation={conversation} 
          token={token} 
          currentUserId={userId}
          currentUserRole={userRole}
          onClose={() => setShowInfoPanel(false)} 
          onAvatarUpdated={onAvatarUpdated}
        />
      )}
    </div>
  );
}
