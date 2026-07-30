"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Edit2, X, Maximize2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type PropertyStatus = "Hoạt động" | "Không hoạt động";

interface Building {
  id?: string;
  name: string;
  address: string;
  description: string;
  owner: string;
  totalRooms: number;
  status: PropertyStatus;
  amenities: string[];
  imageUrl: string;
}

const ALL_AMENITIES = ["Wifi", "Chỗ để xe", "Bảo vệ 24/7", "Camera an ninh", "Vệ sinh chung", "Thang máy", "Máy giặt chung", "Sân phơi"];

export default function BuildingsPage() {
  const { data: session } = useSession();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // State cho việc chỉnh sửa hoặc thêm mới
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Building>>({});
  
  // State phóng to ảnh
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBuildings = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/buildings');
      // Giả sử res.data là mảng hoặc nằm trong res.data.data
      let data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // Parse chuỗi amenities thành mảng
      data = data.map((b: any) => ({
        ...b,
        amenities: typeof b.amenities === 'string' && b.amenities.trim() !== '' 
          ? b.amenities.split(',').map((a: string) => a.trim()) 
          : []
      }));

      const sorted = [...data].sort((a: Building, b: Building) => {
        const nameA = a.name || a.buildingName || "";
        const nameB = b.name || b.buildingName || "";
        return nameA.localeCompare(nameB);
      });
      setBuildings(sorted);
      if (sorted.length > 0 && !selectedId) {
        setSelectedId(sorted[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu nhà trọ:", error);
      toast.error("Không thể tải dữ liệu từ API.");
      setBuildings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const filteredBuildings = useMemo(() => {
    return buildings.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "Tất cả" || b.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [buildings, search, filterStatus]);

  const selectedBuilding = useMemo(() => {
    return buildings.find(b => b.id === selectedId) || null;
  }, [buildings, selectedId]);

  const handleSelect = (id?: string) => {
    if (!id || isEditing) return; // Không cho phép đổi lựa chọn khi đang chỉnh sửa
    setSelectedId(id);
  };

  const handleAdd = () => {
    const newId = "NEW_" + Date.now().toString();
    const newBuilding: Building = {
      id: newId,
      name: "",
      address: "",
      description: "",
      owner: "",
      totalRooms: 0,
      status: "Hoạt động",
      amenities: [],
      imageUrl: "https://images.unsplash.com/photo-1499916078039-922301b0eb9b"
    };
    // Thêm vào đầu danh sách
    setBuildings([newBuilding, ...buildings]);
    setSelectedId(newId);
    setEditForm(newBuilding);
    setIsEditing(true);
  };

  const handleEdit = () => {
    if (selectedBuilding) {
      setEditForm({ ...selectedBuilding });
      setIsEditing(true);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("Bạn có chắc chắn muốn xoá nhà trọ này không?")) {
      try {
        if (!String(id).startsWith("NEW_")) {
          await apiClient.delete(`/buildings/${id}`);
          toast.success("Xoá thành công!");
        }
        const newBuildings = buildings.filter(b => b.id !== id);
        setBuildings(newBuildings);
        if (selectedId === id) {
          setSelectedId(newBuildings.length > 0 ? newBuildings[0].id || null : null);
          setIsEditing(false);
        }
      } catch (error) {
        toast.error("Xoá thất bại.");
      }
    }
  };

  const handleSave = async () => {
    try {
      const isNew = String(selectedId).startsWith("NEW_");
      let savedBuilding: Building;
      
      const payload: any = { 
        ...editForm,
        landlordId: session?.user?.id ? parseInt(session.user.id) : 1, // Dự phòng nếu không có session
        amenities: editForm.amenities ? editForm.amenities.join(', ') : ''
      };

      if (isNew) {
        delete payload.id;
        const res = await apiClient.post('/buildings', payload);
        savedBuilding = res.data?.data || res.data;
        toast.success("Thêm mới thành công!");
      } else {
        const res = await apiClient.put(`/buildings/${selectedId}`, payload);
        savedBuilding = res.data?.data || res.data;
        toast.success("Cập nhật thành công!");
      }
      
      // Đảm bảo parse lại amenities từ backend trả về
      if (typeof savedBuilding.amenities === 'string') {
        savedBuilding.amenities = (savedBuilding.amenities as string).split(',').map(a => a.trim()).filter(a => a);
      } else if (!savedBuilding.amenities) {
        savedBuilding.amenities = [];
      }

      setBuildings(prev => {
        let updated = prev.map(b => b.id === selectedId ? { ...b, ...savedBuilding } : b);
        if (isNew) {
           updated = updated.map(b => b.id === selectedId ? savedBuilding : b);
        }
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedId(savedBuilding.id || selectedId);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Save error:", error);
      const msg = error.response?.data?.message;
      if (!msg) {
        toast.error("Có lỗi xảy ra khi lưu.");
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (String(selectedId).startsWith("NEW_")) {
      const newBuildings = buildings.filter(b => b.id !== selectedId);
      setBuildings(newBuildings);
      setSelectedId(newBuildings.length > 0 ? newBuildings[0].id || null : null);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (!isEditing) return;
    const current = editForm.amenities || [];
    if (current.includes(amenity)) {
      setEditForm({ ...editForm, amenities: current.filter(a => a !== amenity) });
    } else {
      setEditForm({ ...editForm, amenities: [...current, amenity] });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen -m-4 sm:-m-6">
      <PanelGroup direction="horizontal" className="flex-1 flex overflow-hidden">
        
        {/* CỘT TRÁI: DANH SÁCH */}
        <Panel defaultSize={65} minSize={30} className="w-full md:w-2/3 flex flex-col border-r bg-slate-50/50">
          <div className="p-4 md:p-6 border-b bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Link href="/landlord/management" className="text-slate-400 hover:text-blue-600 transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Quản lý nhà trọ</h1>
              </div>
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Thêm nhà trọ
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Tìm kiếm theo tên, địa chỉ..." 
                  className="pl-9 bg-white"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <select 
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="Tất cả">Trạng thái (Tất cả)</option>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Không hoạt động">Không hoạt động</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3">STT</th>
                    <th className="px-4 py-3">Nhà trọ</th>
                    <th className="px-4 py-3">Địa chỉ</th>
                    <th className="px-4 py-3">Số phòng</th>
                    <th className="px-4 py-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading && buildings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  )}
                  {!isLoading && filteredBuildings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Không tìm thấy dữ liệu.
                      </td>
                    </tr>
                  )}
                  {filteredBuildings.map((building, idx) => (
                    <tr 
                      key={building.id} 
                      onClick={() => handleSelect(building.id)}
                      className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedId === building.id ? 'bg-blue-100 border-l-4 border-l-blue-600 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                    >
                      <td className={`px-4 py-3 ${selectedId === building.id ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>{idx + 1}</td>
                      <td className={`px-4 py-3 font-semibold ${selectedId === building.id ? 'text-blue-700' : 'text-slate-800'}`}>{building.name}</td>
                      <td className={`px-4 py-3 truncate max-w-[200px] ${selectedId === building.id ? 'text-blue-600' : 'text-slate-600'}`}>{building.address}</td>
                      <td className="px-4 py-3 text-slate-600">{building.totalRooms}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          building.status === 'Hoạt động' ? 'bg-green-100 text-green-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {building.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="hidden md:flex w-2 bg-slate-100 hover:bg-blue-400 transition-colors cursor-col-resize flex-col justify-center items-center group">
          <div className="w-1 h-8 bg-slate-300 rounded-full group-hover:bg-white transition-colors" />
        </PanelResizeHandle>
        
        {/* CỘT PHẢI: CHI TIẾT */}
        <Panel defaultSize={35} minSize={25} className="w-full md:w-1/3 flex flex-col bg-white hidden md:flex overflow-auto">
          {selectedBuilding ? (
            <div className="p-6 flex flex-col gap-6">
              
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Thông tin chi tiết</h2>
                <div className="flex gap-2">
                  {!isEditing && (
                    <>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" size="sm" onClick={handleEdit}>
                        <Edit2 className="w-4 h-4 mr-2" /> Sửa
                      </Button>
                      <Button className="bg-red-500 hover:bg-red-600 text-white" size="sm" onClick={() => handleDelete(selectedBuilding.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Xoá
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Phần Hình Ảnh */}
              <div 
                className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 cursor-zoom-in group"
                onClick={() => selectedBuilding.imageUrl && setZoomedImage(selectedBuilding.imageUrl)}
              >
                {selectedBuilding.imageUrl ? (
                  <>
                    <img 
                      src={selectedBuilding.imageUrl} 
                      alt={selectedBuilding.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Maximize2 className="text-white opacity-0 group-hover:opacity-100 w-8 h-8 drop-shadow-md" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">Chưa có ảnh</span>
                  </div>
                )}
              </div>

              {/* Phần Biểu Mẫu */}
              <div className="space-y-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Tên tòa nhà</Label>
                  <Input 
                    id="name" 
                    placeholder="Nhà trọ mới..."
                    value={isEditing ? (editForm.name || "") : (selectedBuilding.name || "")}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-slate-50 focus-visible:ring-0" : ""}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input 
                    id="address" 
                    value={isEditing ? (editForm.address || "") : (selectedBuilding.address || "")}
                    onChange={e => setEditForm({...editForm, address: e.target.value})}
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-slate-50 focus-visible:ring-0" : ""}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="owner">Chủ sở hữu</Label>
                    <Input 
                      id="owner" 
                      value={isEditing ? (editForm.owner || "") : (selectedBuilding.owner || "")}
                      onChange={e => setEditForm({...editForm, owner: e.target.value})}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-slate-50 focus-visible:ring-0" : ""}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="totalRooms">Tổng số phòng</Label>
                    <Input 
                      id="totalRooms" 
                      type="number"
                      value={isEditing ? editForm.totalRooms : selectedBuilding.totalRooms}
                      onChange={e => setEditForm({...editForm, totalRooms: parseInt(e.target.value) || 0})}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-slate-50 focus-visible:ring-0" : ""}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="status">Trạng thái</Label>
                  <select 
                    id="status"
                    value={isEditing ? (editForm.status || "Hoạt động") : (selectedBuilding.status || "Hoạt động")}
                    onChange={e => setEditForm({...editForm, status: e.target.value as PropertyStatus})}
                    disabled={!isEditing}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Không hoạt động">Không hoạt động</option>
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="desc">Mô tả</Label>
                  <textarea 
                    id="desc"
                    className={`flex min-h-[80px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${!isEditing ? 'bg-slate-50 text-slate-500 focus-visible:ring-0' : 'bg-white'}`}
                    value={isEditing ? (editForm.description || "") : (selectedBuilding.description || "")}
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                    readOnly={!isEditing}
                  />
                </div>

                {/* Tiện nghi */}
                <div className="mt-6">
                  <Label className="mb-3 block">Tiện nghi chung</Label>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {ALL_AMENITIES.map(amenity => {
                        const isChecked = isEditing 
                          ? editForm.amenities?.includes(amenity) 
                          : selectedBuilding.amenities?.includes(amenity) || false;
                        return (
                          <label 
                            key={amenity} 
                            className={`flex items-center gap-2 text-sm ${!isEditing && !isChecked ? 'opacity-50' : 'cursor-pointer'}`}
                          >
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                              checked={isChecked}
                              onChange={() => toggleAmenity(amenity)}
                              disabled={!isEditing}
                            />
                            {amenity}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Cụm nút thao tác ở dưới cùng */}
              {isEditing && (
                <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={handleCancel}>Hủy</Button>
                  <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Lưu</Button>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
              <p>Chọn một nhà trọ từ danh sách để xem chi tiết</p>
            </div>
          )}
        </Panel>
      </PanelGroup>

      {/* LIGHTBOX ĐỂ PHÓNG TO ẢNH */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2"
            onClick={() => setZoomedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
