"use client";

import { useEffect, useState, useRef } from "react";
import { Users, X, User as UserIcon, Phone, LogOut, Camera, Loader2, UserPlus, Search } from "lucide-react";
import { ConversationInfo } from "./ChatWidget";
import { processImageBeforeUpload } from "../../lib/imageUtils";

interface Participant {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

interface Props {
  conversation: ConversationInfo;
  onClose: () => void;
  token: string;
  currentUserId: number;
  currentUserRole: string;
  onAvatarUpdated?: (newImageUrl: string) => void;
}

export default function ChatInfoPanel({ conversation, onClose, token, currentUserId, currentUserRole, onAvatarUpdated }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(conversation.chatImage);
  const [isUploading, setIsUploading] = useState(false);
  
  // States for adding member
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUserRole === "LANDLORD" && conversation.isGroupChat;

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/chat/${conversation.id}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
      }
    } catch (e) {
      console.error("Lỗi khi tải thành viên nhóm", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [conversation.id, token]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !isAdmin) return;

    setIsUploading(true);
    
    try {
      const processedFile = await processImageBeforeUpload(file);
      
      const formData = new FormData();
      formData.append("file", processedFile);

      // 1. Upload to Cloudinary
      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.imageUrl) {
          // 2. Update Group Avatar
          await fetch(`http://localhost:8080/api/chat/group/${conversation.id}/avatar`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ imageUrl: data.imageUrl })
          });
          setAvatar(data.imageUrl);
          // Also update parent state
          if (onAvatarUpdated) {
            onAvatarUpdated(data.imageUrl);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi cập nhật avatar", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!isAdmin || !confirm("Bạn có chắc muốn xoá thành viên này?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/chat/group/${conversation.id}/members/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setParticipants(prev => prev.filter(p => p.id !== userId));
      } else {
        alert("Không thể xoá thành viên này.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Debounce search
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:8080/api/users/search?keyword=${encodeURIComponent(searchKeyword)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Lọc bỏ những người đã có trong nhóm
          const filtered = data.filter((user: any) => !participants.some(p => p.id === user.id));
          setSearchResults(filtered);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchKeyword, token, participants]);

  const handleAddMember = async (userId: number) => {
    if (!isAdmin) return;
    setIsAdding(true);
    try {
      const res = await fetch(`http://localhost:8080/api/chat/group/${conversation.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ memberIds: [userId] })
      });
      if (res.ok) {
        await fetchParticipants(); // Tải lại danh sách
        setShowAddMember(false);
        setSearchKeyword("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-[300px] border-l border-gray-200 bg-white flex flex-col h-full absolute right-0 top-0 bottom-0 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-300 z-20">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-white relative z-30">
        <h3 className="font-semibold text-gray-800">Thông tin đoạn chat</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 relative z-10">
        
        {/* Chat Avatar & Name */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group">
            {avatar ? (
               <img src={avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : conversation.isGroupChat ? (
               <Users size={36} />
            ) : (
               <span className="font-bold text-3xl">{conversation.chatName?.charAt(0).toUpperCase()}</span>
            )}
            
            {isAdmin && (
              <>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                </button>
              </>
            )}
          </div>
          <div className="text-center">
            <h4 className="font-bold text-lg text-gray-900">{conversation.chatName}</h4>
            <p className="text-sm text-gray-500">{conversation.isGroupChat ? "Nhóm trò chuyện" : "Trò chuyện cá nhân"}</p>
          </div>
        </div>

        {/* Participants List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              Thành viên ({participants.length})
            </h5>
            {isAdmin && (
              <button 
                onClick={() => setShowAddMember(!showAddMember)}
                className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"
                title="Thêm người"
              >
                <UserPlus size={16} />
              </button>
            )}
          </div>

          {/* Khung tìm kiếm thêm thành viên */}
          {showAddMember && isAdmin && (
            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm Tên, SĐT, Email..." 
                  className="w-full text-sm pl-8 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                />
              </div>
              {searchKeyword && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {isSearching ? (
                    <p className="text-xs text-center text-gray-400 py-2">Đang tìm...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-xs text-center text-gray-400 py-2">Không tìm thấy người dùng</p>
                  ) : (
                    searchResults.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 hover:bg-white rounded-md border border-transparent hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover"/> : <UserIcon size={12}/>}
                          </div>
                          <span className="text-xs font-medium text-gray-700 truncate">{user.fullName}</span>
                        </div>
                        <button 
                          onClick={() => handleAddMember(user.id)}
                          disabled={isAdding}
                          className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors shrink-0"
                        >
                          Thêm
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-2">Đang tải...</p>
            ) : (
              participants.map(p => {
                const isMe = p.id === currentUserId;
                const isMemberAdmin = p.role === "LANDLORD"; // or if role in DB is ADMIN, but currently user.role is LANDLORD
                return (
                  <div key={p.id} className="flex items-center gap-3 group/item">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <UserIcon size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate flex items-center gap-1">
                        {p.fullName} {isMe && <span className="text-[10px] text-gray-400">(Bạn)</span>}
                        {isMemberAdmin && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Chủ trọ</span>}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={10} /> {p.phone || "Trống"}
                      </p>
                    </div>
                    
                    {/* Nút xoá (chỉ admin mới thấy, không tự xoá admin được) */}
                    {isAdmin && !isMemberAdmin && (
                      <button 
                        onClick={() => handleRemoveMember(p.id)}
                        className="opacity-0 group-hover/item:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all shrink-0"
                        title="Xoá khỏi nhóm"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {conversation.isGroupChat && (
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm">
              <LogOut size={16} />
              Rời khỏi nhóm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
