"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Maximize2, Minimize2 } from "lucide-react";
import ChatWindow from "./ChatWindow";
import ChatList from "./ChatList";

// DTO from backend
export interface ConversationInfo {
  id: number;
  chatName: string;
  isGroupChat: boolean;
  chatImage: string;
  lastMessage: string;
  unreadCount: number;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<ConversationInfo | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Layout logic
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const handleAvatarUpdated = (newImageUrl: string) => {
    if (activeConversation) {
      setActiveConversation({ ...activeConversation, chatImage: newImageUrl });
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Dragging logic
  const widgetRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -20, y: -20 }); // Bottom right offset
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow drag from header
    if ((e.target as HTMLElement).closest(".drag-handle") && !isFullscreen) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && !isFullscreen) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    } else if (isResizingSidebar) {
      setSidebarWidth(prev => {
        const newWidth = prev + e.movementX;
        return Math.max(200, Math.min(newWidth, 600)); // Giới hạn từ 200px - 600px
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    if (isResizingSidebar) {
      setIsResizingSidebar(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  const widgetStyle = isFullscreen
    ? { top: 0, left: 0, width: "100vw", height: "100vh", transform: "none" }
    : {
        bottom: 24,
        right: 24,
        transform: `translate(${position.x + 24}px, ${position.y + 24}px)`,
        width: "800px",
        height: "600px",
        maxWidth: "90vw",
        maxHeight: "90vh"
      };

  return (
    <div
      ref={widgetRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        ...widgetStyle,
        position: isFullscreen ? "fixed" : "fixed",
        zIndex: 50,
      }}
      className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all ${
        isFullscreen ? "rounded-none border-none" : ""
      }`}
    >
      {/* Header (Drag Handle) */}
      <div className="drag-handle flex items-center justify-between px-4 py-3 bg-indigo-600 text-white cursor-move select-none">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <span className="font-semibold">Tin nhắn</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hover:bg-indigo-700 p-1 rounded transition-colors"
            title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-indigo-700 p-1 rounded transition-colors"
            title="Đóng"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Conversation List */}
        <div 
          style={{ width: isFullscreen ? Math.max(sidebarWidth, 250) : sidebarWidth }} 
          className={`border-r border-gray-200 flex-col shrink-0 relative ${
            activeConversation && !isFullscreen ? "hidden md:flex" : "flex"
          }`}
        >
          <ChatList
            activeConversation={activeConversation}
            onSelectConversation={setActiveConversation}
            refreshTrigger={refreshTrigger}
          />
          
          {/* Resizer Handle */}
          <div 
            className="absolute top-0 -right-1 w-2 h-full cursor-col-resize hover:bg-indigo-400/50 z-20 transition-colors"
            onPointerDown={(e) => {
              setIsResizingSidebar(true);
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
          />
        </div>

        {/* Right Main - Chat Window */}
        <div className={`flex-1 flex flex-col ${
          !activeConversation && !isFullscreen ? "hidden md:flex" : "flex"
        }`}>
          {activeConversation ? (
            <ChatWindow 
              conversation={activeConversation} 
              onBack={() => setActiveConversation(null)}
              onAvatarUpdated={handleAvatarUpdated}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400 flex-col gap-4">
              <MessageCircle size={48} className="opacity-20" />
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
