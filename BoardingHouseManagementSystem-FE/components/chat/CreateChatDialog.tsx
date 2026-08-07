"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, User as UserIcon } from "lucide-react";

interface User {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
}

interface Props {
  onChatCreated: (conversation: any) => void;
  token: string;
}

export default function CreateChatDialog({ onChatCreated, token }: Props) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [chatName, setChatName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setKeyword("");
      setUsers([]);
      setSelectedUsers([]);
      setChatName("");
    }
  }, [open]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (keyword.trim()) {
        searchUsers(keyword);
      } else {
        setUsers([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  const searchUsers = async (q: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/search?keyword=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectUser = (u: User) => {
    if (selectedUsers.some((selected) => selected.id === u.id)) {
      setSelectedUsers(selectedUsers.filter((selected) => selected.id !== u.id));
    } else {
      setSelectedUsers([...selectedUsers, u]);
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;
    setLoading(true);

    try {
      if (selectedUsers.length === 1) {
        const res = await fetch(`http://localhost:8080/api/chat/1on1?userId=${selectedUsers[0].id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          onChatCreated(data);
          setOpen(false);
        }
      } else {
        // Group chat
        const res = await fetch(`http://localhost:8080/api/chat/group`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chatName: chatName || "Nhóm mới",
            memberIds: selectedUsers.map(u => u.id),
          })
        });
        if (res.ok) {
          const data = await res.json();
          onChatCreated(data);
          setOpen(false);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Tạo nhóm chat">
          <Plus size={20} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo cuộc trò chuyện mới</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên, SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="max-h-[200px] overflow-y-auto space-y-2 border border-gray-100 rounded-lg p-2">
            {users.length === 0 && keyword.length > 0 ? (
              <p className="text-center text-sm text-gray-400 p-4">Không tìm thấy người dùng.</p>
            ) : (
              users.map((u) => {
                const isSelected = selectedUsers.some((selected) => selected.id === u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <UserIcon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{u.fullName}</p>
                      <p className="text-xs text-gray-500">{u.phone}</p>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by div click
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedUsers.length >= 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm</label>
              <input
                type="text"
                placeholder="Nhập tên nhóm..."
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <button
            onClick={handleCreateChat}
            disabled={selectedUsers.length === 0 || loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Đang tạo..." : selectedUsers.length >= 2 ? "Tạo nhóm" : "Tạo cuộc trò chuyện"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
