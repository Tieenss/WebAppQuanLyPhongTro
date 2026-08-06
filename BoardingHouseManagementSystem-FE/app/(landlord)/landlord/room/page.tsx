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

type RoomStatus = "Trống" | "Đã thuê" | "Đang sửa";

interface Room {
  id?: string;
  code: string;
  name: string;
  building: string;
  status: RoomStatus;
  floor: number;
  area: string;
  maxOccupancy: number;
  rentPrice: number;
  depositPrice: number;
  description: string;
  amenities: string[];
  imageUrl: string;
  tenants?: string[];
}

const ALL_AMENITIES = ["Điều hòa", "Nóng lạnh", "Giường", "Tủ quần áo", "Tủ lạnh", "Bàn ghế", "Máy giặt", "Ban công"];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [filterBuilding, setFilterBuilding] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [buildingsList, setBuildingsList] = useState<{ id: string, name: string }[]>([]);
  const [tenantsList, setTenantsList] = useState<{ id: string, name: string }[]>([]);

  // State cho việc chỉnh sửa hoặc thêm mới
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Room>>({});
  const [newTenantName, setNewTenantName] = useState("");

  // State phóng to ảnh
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/rooms');
      // Giả sử res.data là mảng hoặc nằm trong res.data.data
      let rawData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const mappedData: Room[] = rawData.map((item: any) => ({
        id: item.id?.toString(),
        code: item.roomNumber || "",
        name: `Phòng ${item.roomNumber || ""}`,
        building: item.buildingName || item.building?.name || item.building?.id || "",
        status: item.status === 'available' ? "Trống" : item.status === 'rented' ? "Đã thuê" : "Đang sửa",
        floor: 1,
        area: item.area ? `${item.area}m2` : "",
        maxOccupancy: item.maxOccupants || 0,
        rentPrice: item.price || 0,
        depositPrice: item.price || 0,
        description: item.description || "",
        amenities: item.amenities ? item.amenities.split(',').map((s: string) => s.trim()) : [],
        imageUrl: item.imageUrl || "",
        tenants: []
      }));
      const sorted = [...mappedData].sort((a: Room, b: Room) => {
        const nameA = a.name || a.code || "";
        const nameB = b.name || b.code || "";
        return nameA.localeCompare(nameB);
      });
      setRooms(sorted);
      if (sorted.length > 0 && !selectedId) {
        setSelectedId(sorted[0].id || null);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu phòng:", error);
      toast.error("Không thể tải dữ liệu từ API.");
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const bRes = await apiClient.get('/buildings');
      const bData = Array.isArray(bRes.data) ? bRes.data : bRes.data?.data || [];
      setBuildingsList(bData.map((b: any) => ({ id: b.id, name: b.name })));
    } catch {
      setBuildingsList([]);
    }

    try {
      const tRes = await apiClient.get('/tenants');
      const tData = Array.isArray(tRes.data) ? tRes.data : tRes.data?.data || [];
      setTenantsList(tData.map((t: any) => ({ id: t.id, name: t.name })));
    } catch {
      setTenantsList([]);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchDependencies();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const roomName = r.name || (r as any).roomNumber || "";
      const roomCode = r.code || (r as any).roomNumber || "";
      const matchSearch = roomName.toLowerCase().includes(search.toLowerCase()) || roomCode.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "Tất cả" || r.status === filterStatus;
      const matchBuilding = filterBuilding === "Tất cả" || r.building === filterBuilding;
      return matchSearch && matchStatus && matchBuilding;
    });
  }, [rooms, search, filterStatus, filterBuilding]);

  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedId) || null;
  }, [rooms, selectedId]);

  const handleSelect = (id?: string) => {
    if (!id || isEditing) return; // Không cho phép đổi lựa chọn khi đang chỉnh sửa
    setSelectedId(id);
  };

  const handleAdd = () => {
    const newId = "NEW_" + Date.now().toString();
    const newRoom: Room = {
      id: newId,
      code: "P_NEW",
      name: "",
      building: "",
      status: "Trống",
      floor: 1,
      area: "",
      maxOccupancy: 1,
      rentPrice: 0,
      depositPrice: 0,
      description: "",
      amenities: [],
      imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb",
      tenants: []
    };
    // Thêm vào đầu danh sách
    setRooms([newRoom, ...rooms]);
    setSelectedId(newId);
    setEditForm(newRoom);
    setIsEditing(true);
  };

  const handleEdit = () => {
    if (selectedRoom) {
      setEditForm({ ...selectedRoom });
      setIsEditing(true);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("Bạn có chắc chắn muốn xoá phòng này không?")) {
      try {
        if (!String(id).startsWith("NEW_")) {
          await apiClient.delete(`/rooms/${id}`);
          toast.success("Xoá thành công!");
        }
        const newRooms = rooms.filter(r => r.id !== id);
        setRooms(newRooms);
        if (selectedId === id) {
          setSelectedId(newRooms.length > 0 ? newRooms[0].id || null : null);
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
      let savedRoom: Room;

      if (isNew) {
        // Tìm ID của toà nhà bằng tên vì editForm.building hiện tại đang lưu tên
        const buildingId = buildingsList.find(b => b.name === editForm.building)?.id;
        const payload = {
          buildingId: buildingId ? parseInt(buildingId) : null,
          roomNumber: (editForm.name || "").replace("Phòng ", "") || editForm.code,
          price: editForm.rentPrice,
          area: parseFloat((editForm.area || "").replace("m2", "")) || 0,
          maxOccupants: editForm.maxOccupancy,
          status: editForm.status === 'Trống' ? 'available' : editForm.status === 'Đã thuê' ? 'rented' : 'maintenance',
          description: editForm.description,
          amenities: (editForm.amenities || []).join(', ')
        };

        const res = await apiClient.post('/rooms', payload);
        const mappedRoom = {
          ...editForm,
          id: res.data?.id?.toString() || res.data?.data?.id?.toString()
        };
        savedRoom = mappedRoom as Room;
        toast.success("Thêm mới thành công!");
      } else {
        const buildingId = buildingsList.find(b => b.name === editForm.building)?.id;
        const payload = {
          buildingId: buildingId ? parseInt(buildingId) : null,
          roomNumber: (editForm.name || "").replace("Phòng ", "") || editForm.code,
          price: editForm.rentPrice,
          area: parseFloat((editForm.area || "").replace("m2", "")) || 0,
          maxOccupants: editForm.maxOccupancy,
          status: editForm.status === 'Trống' ? 'available' : editForm.status === 'Đã thuê' ? 'rented' : 'maintenance',
          description: editForm.description,
          amenities: (editForm.amenities || []).join(', ')
        };

        const res = await apiClient.put(`/rooms/${selectedId}`, payload);
        const mappedRoom = {
          ...editForm
        };
        savedRoom = mappedRoom as Room;
        toast.success("Cập nhật thành công!");
      }

      setRooms(prev => {
        let updated = prev.map(r => r.id === selectedId ? { ...r, ...savedRoom } : r);
        if (isNew) {
          updated = updated.map(r => r.id === selectedId ? savedRoom : r);
        }
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedId(savedRoom.id || selectedId);
      setIsEditing(false);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (!msg) {
        toast.error("Có lỗi xảy ra khi lưu.");
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (String(selectedId).startsWith("NEW_")) {
      const newRooms = rooms.filter(r => r.id !== selectedId);
      setRooms(newRooms);
      setSelectedId(newRooms.length > 0 ? newRooms[0].id || null : null);
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

  const handleAddTenant = () => {
    if (!newTenantName.trim() || !isEditing) return;
    const currentTenants = editForm.tenants || [];
    if (!currentTenants.includes(newTenantName.trim())) {
      setEditForm({ ...editForm, tenants: [...currentTenants, newTenantName.trim()] });
    }
    setNewTenantName("");
  };

  const handleRemoveTenant = (tenantToRemove: string) => {
    if (!isEditing) return;
    const currentTenants = editForm.tenants || [];
    setEditForm({ ...editForm, tenants: currentTenants.filter(t => t !== tenantToRemove) });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 w-full flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)]">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <Link href="/landlord/management" className="text-slate-400 hover:text-blue-600 transition-colors mt-1 sm:mt-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý phòng</h1>
            <p className="mt-1 text-sm text-slate-500">Quản lý danh sách phòng, giá thuê và trạng thái từng phòng.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">Tòa nhà:</span>
            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
              value={filterBuilding}
              onChange={e => setFilterBuilding(e.target.value)}
            >
              <option value="Tất cả">Tất cả</option>
              {buildingsList.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAdd} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Thêm phòng</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <PanelGroup orientation="horizontal" className="w-full h-full flex">
          
          {/* CỘT TRÁI: DANH SÁCH */}
          <Panel defaultSize={65} minSize={30} className="w-full md:w-2/3 flex flex-col border-r border-slate-100 bg-slate-50/30">
            <div className="p-4 md:p-5 border-b border-slate-100 bg-white">
              <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo mã phòng, tên phòng..."
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
                  <option value="Trống">Trống</option>
                  <option value="Đã thuê">Đã thuê</option>
                  <option value="Đang sửa">Đang sửa</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3 w-16">STT</th>
                    <th className="px-4 py-3">Mã phòng</th>
                    <th className="px-4 py-3">Tên phòng</th>
                    <th className="px-4 py-3">Người thuê</th>
                    <th className="px-4 py-3">Tòa nhà</th>
                    <th className="px-4 py-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRooms.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Không tìm thấy phòng nào
                      </td>
                    </tr>
                  )}
                  {filteredRooms.map((room, idx) => (
                    <tr
                      key={room.id}
                      onClick={() => handleSelect(room.id)}
                      className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedId === room.id ? 'bg-blue-100 border-l-4 border-l-blue-600 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                    >
                      <td className={`px-4 py-3 ${selectedId === room.id ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>{idx + 1}</td>
                      <td className={`px-4 py-3 font-semibold ${selectedId === room.id ? 'text-blue-700' : 'text-slate-800'}`}>{room.code}</td>
                      <td className={`px-4 py-3 font-medium ${selectedId === room.id ? 'text-blue-700' : 'text-slate-800'}`}>{room.name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {room.tenants && room.tenants.length > 0 ? (
                          <span className={`font-medium ${selectedId === room.id ? 'text-blue-600' : 'text-slate-800'}`}>{room.tenants[0]}</span>
                        ) : (
                          <span className="text-slate-400 italic">Trống</span>
                        )}
                        {room.tenants && room.tenants.length > 1 && (
                          <span className="ml-1 text-xs text-slate-500">+{room.tenants.length - 1}</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 truncate max-w-[150px] ${selectedId === room.id ? 'text-blue-600' : 'text-slate-600'}`}>{room.building}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${room.status === 'Trống' ? 'bg-slate-100 text-slate-700' :
                            room.status === 'Đã thuê' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                          }`}>
                          {room.status}
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
          {selectedRoom ? (
            <div className="p-6 flex flex-col gap-6">

              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Thông tin phòng chi tiết</h2>
                <div className="flex gap-2">
                  {!isEditing && (
                    <>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" size="sm" onClick={handleEdit}>
                        <Edit2 className="w-4 h-4 mr-2" /> Sửa
                      </Button>
                      <Button className="bg-red-500 hover:bg-red-600 text-white" size="sm" onClick={() => handleDelete(selectedRoom.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Xoá
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Phần Hình Ảnh */}
              <div
                className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 cursor-zoom-in group"
                onClick={() => selectedRoom.imageUrl && setZoomedImage(selectedRoom.imageUrl)}
              >
                {selectedRoom.imageUrl ? (
                  <>
                    <img
                      src={selectedRoom.imageUrl}
                      alt={selectedRoom.name}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="code">Mã phòng</Label>
                    <Input
                      id="code"
                      value={isEditing ? (editForm.code || "") : (selectedRoom.code || "")}
                      onChange={e => setEditForm({ ...editForm, code: e.target.value })}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-slate-50 focus-visible:ring-0" : ""}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Tên phòng</Label>
                    <Input
                      id="name"
                      placeholder="Nhập tên phòng..."
                      value={isEditing ? (editForm.name || "") : (selectedRoom.name || "")}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-slate-50 focus-visible:ring-0" : ""}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="building">Tòa nhà</Label>
                  <select
                    id="building"
                    value={isEditing ? (editForm.building || "") : (selectedRoom.building || "")}
                    onChange={e => setEditForm({ ...editForm, building: e.target.value })}
                    disabled={!isEditing}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50"
                  >
                    <option value="" disabled>Chọn tòa nhà</option>
                    {buildingsList.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="status">Trạng thái</Label>
                  <select
                    id="status"
                    value={isEditing ? editForm.status : selectedRoom.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as RoomStatus })}
                    disabled={!isEditing}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50"
                  >
                    <option value="Trống">Trống</option>
                    <option value="Đã thuê">Đã thuê</option>
                    <option value="Đang sửa">Đang sửa</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="floor">Tầng</Label>
                    <Input
                      id="floor"
                      type="number"
                      value={isEditing ? editForm.floor : selectedRoom.floor}
                      onChange={e => setEditForm({ ...editForm, floor: parseInt(e.target.value) || 0 })}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-slate-50 focus-visible:ring-0" : ""}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="area">Diện tích</Label>
                    <Input
                      id="area"
                      value={isEditing ? (editForm.area || "") : (selectedRoom.area || "")}
                      onChange={e => setEditForm({ ...editForm, area: e.target.value })}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-slate-50 focus-visible:ring-0" : ""}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="maxOcc">Số người tối đa</Label>
                    <Input
                      id="maxOcc"
                      type="number"
                      value={isEditing ? editForm.maxOccupancy : selectedRoom.maxOccupancy}
                      onChange={e => setEditForm({ ...editForm, maxOccupancy: parseInt(e.target.value) || 0 })}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-slate-50 focus-visible:ring-0" : ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="rentPrice">Giá thuê (VNĐ)</Label>
                    {isEditing ? (
                      <Input
                        id="rentPrice"
                        type="number"
                        value={editForm.rentPrice}
                        onChange={e => setEditForm({ ...editForm, rentPrice: parseInt(e.target.value) || 0 })}
                      />
                    ) : (
                      <Input
                        id="rentPrice"
                        value={formatCurrency(selectedRoom.rentPrice)}
                        readOnly
                        className="bg-slate-50 focus-visible:ring-0"
                      />
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="depositPrice">Tiền cọc (VNĐ)</Label>
                    {isEditing ? (
                      <Input
                        id="depositPrice"
                        type="number"
                        value={editForm.depositPrice}
                        onChange={e => setEditForm({ ...editForm, depositPrice: parseInt(e.target.value) || 0 })}
                      />
                    ) : (
                      <Input
                        id="depositPrice"
                        value={formatCurrency(selectedRoom.depositPrice)}
                        readOnly
                        className="bg-slate-50 focus-visible:ring-0"
                      />
                    )}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="desc">Mô tả thêm</Label>
                  <textarea
                    id="desc"
                    className={`flex min-h-[80px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${!isEditing ? 'bg-slate-50 text-slate-500 focus-visible:ring-0' : 'bg-white'}`}
                    value={isEditing ? (editForm.description || "") : (selectedRoom.description || "")}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    readOnly={!isEditing}
                  />
                </div>

                {/* Tiện nghi */}
                <div className="mt-6">
                  <Label className="mb-3 block">Tiện nghi</Label>
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {ALL_AMENITIES.map(amenity => {
                        const isChecked = isEditing
                          ? editForm.amenities?.includes(amenity)
                          : selectedRoom.amenities?.includes(amenity) || false;
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

                {/* Người thuê */}
                <div className="mt-6">
                  <Label className="mb-3 block">Người thuê</Label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(isEditing ? editForm.tenants : selectedRoom.tenants)?.map((tenant, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-full text-sm text-slate-700 shadow-sm">
                          <span>{tenant}</span>
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveTenant(tenant)}
                              className="text-slate-400 hover:text-red-500 ml-1 focus:outline-none"
                              title="Xóa"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      {!(isEditing ? editForm.tenants : selectedRoom.tenants)?.length && (
                        <span className="text-sm text-slate-400 italic">Chưa có người thuê</span>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 mt-4">
                        <Input
                          list="tenants-list"
                          placeholder="Nhập hoặc chọn tên người thuê..."
                          value={newTenantName}
                          onChange={e => setNewTenantName(e.target.value)}
                          className="flex-1 bg-white"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTenant()}
                        />
                        <datalist id="tenants-list">
                          {tenantsList.map(t => (
                            <option key={t.id} value={t.name} />
                          ))}
                        </datalist>
                        <Button
                          onClick={handleAddTenant}
                          disabled={!newTenantName.trim()}
                          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                        >
                          Thêm
                        </Button>
                      </div>
                    )}
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
              <p>Chọn một phòng từ danh sách để xem chi tiết</p>
            </div>
          )}
        </Panel>
        </PanelGroup>
      </div>

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
