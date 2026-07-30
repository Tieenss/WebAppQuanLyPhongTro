"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, Plus, Edit2, Trash2, ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";

interface Contract {
  id: string;
  contractCode: string;
  roomNumber: string;
  tenantName: string;
  endDate: string;
  status: string;
  startDate: string;
  createdAt: string;
  rentalPrice: number;
  deposit: number;
  terms: string;
  assets?: string;
  paymentDate?: string;
  electricityPrice?: number;
  waterPrice?: number;
  wifiPrice?: number;
  parkingPrice?: number;
  servicePrice?: number;
  area?: number;
  leaseDuration?: number;
  
  landlordName?: string;
  landlordCccd?: string;
  landlordCccdPlace?: string;
  landlordPhone?: string;

  tenantCccd?: string;
  tenantCccdPlace?: string;
  tenantPhone?: string;
}

export default function ContractsPage() {
  const { data: session } = useSession();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filterBuilding, setFilterBuilding] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [editForm, setEditForm] = useState<any>({});

  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);

  useEffect(() => {
    fetchContracts();
    fetchDependencies();
  }, []);

  useEffect(() => {
    if (contracts.length > 0 && !selectedContract && !isCreating && rooms.length > 0) {
      const first = contracts[0];
      const room = rooms.find(r => r.roomNumber === first.roomNumber || r.id?.toString() === first.roomNumber);
      
      let duration = 0;
      if (first.startDate && first.endDate) {
        const parseLocal = (dateStr: string) => {
          if (!dateStr || !dateStr.includes('-')) return new Date();
          const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
          return new Date(year, month - 1, day);
        };
        const d1 = parseLocal(first.startDate);
        const d2 = parseLocal(first.endDate);
        duration = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
      }
      
      const enhancedContract = {
        ...first,
        area: room?.area || "",
        leaseDuration: duration > 0 ? duration : (first.leaseDuration || "")
      };

      setSelectedContract(enhancedContract);
      setEditForm(enhancedContract);
      
      // Tìm phòng và toà nhà cho hợp đồng này để gán selectedBuildingId nếu có thể
      if (room && room.building?.id) {
        setSelectedBuildingId(room.building.id.toString());
      }
    }
  }, [contracts, rooms, selectedContract, isCreating]);

  const fetchDependencies = async () => {
    try {
      const bRes = await apiClient.get('/buildings');
      const bData = Array.isArray(bRes.data) ? bRes.data : bRes.data?.data || [];
      setBuildings(bData);

      const rRes = await apiClient.get('/rooms');
      const rData = Array.isArray(rRes.data) ? rRes.data : rRes.data?.data || [];
      setRooms(rData);
    } catch (error) {
      console.error("Error fetching dependencies", error);
    }
  };

  const fetchContracts = async () => {
    try {
      const res = await apiClient.get('/contracts');
      let rawData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const mapped = rawData.map((c: any) => ({
        ...c,
        id: c.id?.toString(),
      }));
      setContracts(mapped);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRowClick = (contract: Contract) => {
    const room = rooms.find(r => r.roomNumber === contract.roomNumber || r.id?.toString() === contract.roomNumber);
    
    let duration = 0;
    if (contract.startDate && contract.endDate) {
      const parseLocal = (dateStr: string) => {
        if (!dateStr || !dateStr.includes('-')) return new Date();
        const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day);
      };
      const d1 = parseLocal(contract.startDate);
      const d2 = parseLocal(contract.endDate);
      duration = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    }

    const enhancedContract = {
      ...contract,
      area: room?.area || "",
      leaseDuration: duration > 0 ? duration : (contract.leaseDuration || "")
    };

    setSelectedContract(enhancedContract);
    setIsEditing(false);
    setIsCreating(false);
    setEditForm(enhancedContract);
    
    // Tìm phòng và toà nhà cho hợp đồng này để gán selectedBuildingId nếu có thể
    if (room && room.building?.id) {
      setSelectedBuildingId(room.building.id.toString());
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setSelectedContract(null);
    setIsEditing(true);
    setEditForm({
      startDate: new Date().toISOString().split('T')[0],
      leaseDuration: 6,
      status: 'active',
      deposit: 0,
      rentalPrice: 0,
      electricityPrice: 0,
      waterPrice: 0,
      wifiPrice: 0,
      parkingPrice: 0,
      servicePrice: 0,
      terms: "1. Bên thuê phải thanh toán đúng hạn.\n2. Giữ gìn vệ sinh chung.\n3. Không gây ồn ào sau 10h đêm.",
      assets: "Điều hòa: 1 cái\nGiường: 1 chiếc\nTủ quần áo: 1 cái\nChìa khóa: 2 cái",
      paymentDate: "5",
    });
    setSelectedBuildingId("all");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...selectedContract });
  };

  const calculateEndDate = (startDate: string, months: number) => {
    if (!startDate || !months) return "";
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleRoomChange = (roomId: string) => {
    const room = rooms.find(r => r.id?.toString() === roomId || r.roomNumber === roomId);
    if (room) {
      setEditForm({
        ...editForm,
        roomNumber: room.roomNumber || room.id,
        rentalPrice: room.rentPrice || room.price || 0,
        deposit: room.depositPrice || room.price || 0,
        area: room.area || "",
      });
    } else {
      setEditForm({
        ...editForm,
        roomNumber: roomId
      });
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...editForm };
      
      const selectedRoom = rooms.find(r => r.roomNumber === payload.roomNumber || r.id?.toString() === payload.roomNumber);
      if (selectedRoom) {
         payload.roomId = selectedRoom.id;
         payload.room = { id: selectedRoom.id };
         if (!payload.roomNumber) payload.roomNumber = selectedRoom.roomNumber;
      }
      
      let savedContract;
      if (isCreating) {
        const res = await apiClient.post('/contracts', payload);
        savedContract = res.data?.data || res.data;
        toast.success("Thêm hợp đồng thành công!");
      } else {
        const res = await apiClient.put(`/contracts/${selectedContract?.id}`, payload);
        savedContract = res.data?.data || res.data;
        toast.success("Cập nhật hợp đồng thành công!");
      }
      
      fetchContracts();
      handleRowClick({
        ...savedContract,
        leaseDuration: editForm.leaseDuration,
        area: editForm.area
      });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message;
      if (!msg) {
        toast.error("Có lỗi xảy ra khi lưu hợp đồng.");
      }
    }
  };

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch = c.contractCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.tenantName?.toLowerCase().includes(search.toLowerCase());

    let matchesBuilding = true;
    if (filterBuilding !== "Tất cả") {
      const room = rooms.find(r => r.roomNumber === c.roomNumber || r.id?.toString() === c.roomNumber);
      const buildingName = room?.buildingName || (typeof room?.building === 'object' ? room?.building?.name : room?.building);
      matchesBuilding = buildingName === filterBuilding;
    }

    let matchesStatus = true;
    if (filterStatus !== "Tất cả") {
      matchesStatus = c.status === filterStatus;
    }

    return matchesSearch && matchesBuilding && matchesStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen -m-4 sm:-m-6">
      <PanelGroup direction="horizontal" className="flex-1 flex overflow-hidden">
        {/* CỘT TRÁI: DANH SÁCH HỢP ĐỒNG */}
        <Panel defaultSize={65} minSize={30} className="w-full md:w-2/3 flex flex-col border-r bg-slate-50/50 relative">
          
          <div className="p-4 md:p-6 border-b bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Link href="/landlord/management" className="text-slate-400 hover:text-blue-600 transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Quản lý hợp đồng</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">Tòa nhà:</span>
                <select
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  value={filterBuilding}
                  onChange={e => setFilterBuilding(e.target.value)}
                >
                  <option value="Tất cả">Tất cả</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" /> Thêm hợp đồng
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Tìm kiếm mã HĐ, phòng..." 
                  className="pl-9 bg-white"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto flex gap-2">
                <select 
                  className="w-full sm:w-40 h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="Tất cả">Trạng thái (Tất cả)</option>
                  <option value="active">Hoạt động</option>
                  <option value="expired">Hết hạn</option>
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
                    <th className="px-4 py-3">Mã HD</th>
                    <th className="px-4 py-3">Phòng</th>
                    <th className="px-4 py-3">Người thuê</th>
                    <th className="px-4 py-3">Hạn hợp đồng</th>
                    <th className="px-4 py-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredContracts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Không tìm thấy hợp đồng nào.
                      </td>
                    </tr>
                  )}
                  {filteredContracts.map((c, idx) => (
                    <tr 
                      key={c.id} 
                      onClick={() => handleRowClick(c)}
                      className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedContract?.id === c.id ? 'bg-blue-100 border-l-4 border-l-blue-600 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                    >
                      <td className={`px-4 py-3 ${selectedContract?.id === c.id ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>{idx + 1}</td>
                      <td className={`px-4 py-3 font-semibold ${selectedContract?.id === c.id ? 'text-blue-700' : 'text-slate-800'}`}>{c.contractCode || `HD00${idx+1}`}</td>
                      <td className={`px-4 py-3 ${selectedContract?.id === c.id ? 'text-blue-600' : 'text-slate-600'}`}>{c.roomNumber}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{c.tenantName || "Trống"}</td>
                      <td className={`px-4 py-3 font-medium ${c.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>{c.endDate}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === 'active' ? 'bg-green-100 text-green-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {c.status === 'active' ? 'Hoạt động' : 'Kết thúc'}
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

        {/* CỘT PHẢI: CHI TIẾT HỢP ĐỒNG */}
        <Panel defaultSize={35} minSize={25} className="w-full md:w-1/3 flex flex-col bg-white hidden md:flex overflow-auto">
          {selectedContract || isCreating ? (
            <div className="p-6 flex flex-col gap-6">
              
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">
                  {isCreating ? "Tạo hợp đồng mới" : "Thông tin chi tiết"}
                </h2>
                {!isCreating && (
                  <div className="flex gap-2">
                    {!isEditing && (
                      <>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" size="sm" onClick={handleEdit}>
                          <Edit2 className="w-4 h-4 mr-2" /> Sửa
                        </Button>
                        <Button className="bg-red-500 hover:bg-red-600 text-white" size="sm" onClick={async () => {
                          if (confirm("Bạn có chắc muốn xóa hợp đồng này?")) {
                            try {
                              await apiClient.delete(`/contracts/${selectedContract?.id}`);
                              toast.success("Đã xóa hợp đồng");
                              fetchContracts();
                              setSelectedContract(null);
                            } catch (e) {
                              toast.error("Lỗi khi xóa hợp đồng");
                            }
                          }
                        }}>
                          <Trash2 className="w-4 h-4 mr-2" /> Xoá
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                
                {/* Thông tin chung */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-y-3">
                  <label className="text-sm font-medium text-slate-700">Mã HD:</label>
                  <Input 
                    readOnly={!isCreating && !isEditing} 
                    value={(isEditing || isCreating) ? (editForm.contractCode || "") : (selectedContract?.contractCode || "")}
                    onChange={e => setEditForm({...editForm, contractCode: e.target.value})}
                    className="bg-slate-100/50 border-slate-200 h-9" 
                  />
                  
                  <label className="text-sm font-medium text-slate-700">Tòa nhà:</label>
                  <select 
                    disabled={!isCreating && !isEditing}
                    value={selectedBuildingId}
                    onChange={e => setSelectedBuildingId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">Tất cả</option>
                    {buildings.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                  </select>

                  <label className="text-sm font-medium text-slate-700">Phòng:</label>
                  <div className="relative">
                    <input 
                      disabled={!isCreating && !isEditing}
                      value={editForm.roomNumber || ""}
                      onChange={e => {
                        handleRoomChange(e.target.value);
                        setRoomDropdownOpen(true);
                      }}
                      onClick={() => { if (isCreating || isEditing) setRoomDropdownOpen(true); }}
                      onBlur={() => setTimeout(() => setRoomDropdownOpen(false), 200)}
                      placeholder="Chọn hoặc gõ tên phòng"
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <ChevronDown 
                      className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                      onClick={() => { if (isCreating || isEditing) setRoomDropdownOpen(!roomDropdownOpen); }}
                    />
                    
                    {roomDropdownOpen && (isCreating || isEditing) && (
                      <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {rooms
                          .filter(r => selectedBuildingId === "all" || r.building?.id?.toString() === selectedBuildingId)
                          .filter(r => !contracts.some(c => c.status === "active" && (c.roomNumber === r.roomNumber || c.roomNumber === r.id?.toString())))
                          .filter(r => (r.roomNumber || r.name || r.id).toLowerCase().includes((editForm.roomNumber || "").toLowerCase()))
                          .map(r => (
                          <li
                            key={r.id}
                            className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-slate-100 text-slate-900"
                            onClick={() => {
                              handleRoomChange(r.roomNumber || r.id);
                              setRoomDropdownOpen(false);
                            }}
                          >
                            {r.name || r.roomNumber}
                          </li>
                        ))}
                        {rooms.filter(r => selectedBuildingId === "all" || r.building?.id?.toString() === selectedBuildingId).filter(r => !contracts.some(c => c.status === "active" && (c.roomNumber === r.roomNumber || c.roomNumber === r.id?.toString()))).filter(r => (r.roomNumber || r.name || r.id).toLowerCase().includes((editForm.roomNumber || "").toLowerCase())).length === 0 && (
                          <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-slate-500">
                            Không tìm thấy phòng
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                  
                  <label className="text-sm font-medium text-slate-700">Diện tích:</label>
                  <Input 
                    readOnly={!isCreating && !isEditing} 
                    value={(isEditing || isCreating) ? (editForm.area || "") : (selectedContract?.area || "")}
                    onChange={e => setEditForm({...editForm, area: e.target.value})}
                    className="bg-slate-100/50 border-slate-200 h-9" 
                  />
                  
                  <label className="text-sm font-medium text-slate-700">Giá phòng:</label>
                  <Input 
                    type="number"
                    readOnly={!isCreating && !isEditing} 
                    value={(isEditing || isCreating) ? (editForm.rentalPrice || "") : (selectedContract?.rentalPrice || "")}
                    onChange={e => setEditForm({...editForm, rentalPrice: Number(e.target.value)})}
                    className="bg-slate-100/50 border-slate-200 h-9" 
                  />
                </div>

                {/* Thông tin chủ trọ */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Thông tin chủ trọ</h3>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-y-3">
                    <label className="text-sm font-medium text-slate-700">Họ tên:</label>
                    <Input 
                      readOnly={!isCreating && !isEditing} 
                      value={(isEditing || isCreating) ? (editForm.landlordName || "") : (selectedContract?.landlordName || "")}
                      onChange={e => setEditForm({...editForm, landlordName: e.target.value})}
                      className="bg-slate-100/50 border-slate-200 h-9" 
                    />
                    
                    <label className="text-sm font-medium text-slate-700">CCCD:</label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.landlordCccd || "") : (selectedContract?.landlordCccd || "")}
                        onChange={e => setEditForm({...editForm, landlordCccd: e.target.value})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Nơi cấp:</span>
                      <Input 
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.landlordCccdPlace || "") : (selectedContract?.landlordCccdPlace || "")}
                        onChange={e => setEditForm({...editForm, landlordCccdPlace: e.target.value})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                    </div>

                    <label className="text-sm font-medium text-slate-700">SĐT:</label>
                    <Input 
                      readOnly={!isCreating && !isEditing} 
                      value={(isEditing || isCreating) ? (editForm.landlordPhone || "") : (selectedContract?.landlordPhone || "")}
                      onChange={e => setEditForm({...editForm, landlordPhone: e.target.value})}
                      className="bg-slate-100/50 border-slate-200 h-9" 
                    />
                  </div>
                </div>

                {/* Thông tin người thuê */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Thông tin người thuê</h3>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-y-3">
                    <label className="text-sm font-medium text-slate-700">Họ tên:</label>
                    <Input 
                      readOnly={!isCreating && !isEditing} 
                      value={(isEditing || isCreating) ? (editForm.tenantName || "") : (selectedContract?.tenantName || "")}
                      onChange={e => setEditForm({...editForm, tenantName: e.target.value})}
                      className="bg-slate-100/50 border-slate-200 h-9" 
                    />
                    
                    <label className="text-sm font-medium text-slate-700">CCCD:</label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.tenantCccd || "") : (selectedContract?.tenantCccd || "")}
                        onChange={e => setEditForm({...editForm, tenantCccd: e.target.value})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Nơi cấp:</span>
                      <Input 
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.tenantCccdPlace || "") : (selectedContract?.tenantCccdPlace || "")}
                        onChange={e => setEditForm({...editForm, tenantCccdPlace: e.target.value})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                    </div>

                    <label className="text-sm font-medium text-slate-700">SĐT:</label>
                    <Input 
                      readOnly={!isCreating && !isEditing} 
                      value={(isEditing || isCreating) ? (editForm.tenantPhone || "") : (selectedContract?.tenantPhone || "")}
                      onChange={e => setEditForm({...editForm, tenantPhone: e.target.value})}
                      className="bg-slate-100/50 border-slate-200 h-9" 
                    />
                  </div>
                </div>

                {/* Thời hạn */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Thời hạn hợp đồng</h3>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-y-3">
                    <label className="text-sm font-medium text-slate-700">Ngày bắt đầu:</label>
                    <Input 
                      type="date" 
                      readOnly={!isCreating && !isEditing} 
                      value={(isEditing || isCreating) ? (editForm.startDate || "") : (selectedContract?.startDate?.split('T')[0] || "")}
                      onChange={e => {
                        const newStartDate = e.target.value;
                        const newEndDate = calculateEndDate(newStartDate, editForm.leaseDuration);
                        setEditForm({...editForm, startDate: newStartDate, endDate: newEndDate});
                      }}
                      className="bg-slate-100/50 border-slate-200 h-9" 
                    />
                    
                    <label className="text-sm font-medium text-slate-700">Thời hạn thuê:</label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="number"
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.leaseDuration || "") : (selectedContract?.leaseDuration || "")}
                        onChange={e => {
                          const duration = Number(e.target.value);
                          const newEndDate = calculateEndDate(editForm.startDate, duration);
                          setEditForm({...editForm, leaseDuration: duration, endDate: newEndDate});
                        }}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                      <span className="text-sm text-slate-500">tháng</span>
                    </div>

                    <label className="text-sm font-medium text-slate-700">Ngày kết thúc:</label>
                    <Input 
                      type="date" 
                      readOnly={!isCreating && !isEditing} 
                      value={(isEditing || isCreating) ? (editForm.endDate || "") : (selectedContract?.endDate?.split('T')[0] || "")}
                      onChange={e => setEditForm({...editForm, endDate: e.target.value})}
                      className="bg-slate-100/50 border-slate-200 h-9" 
                    />
                    
                    <label className="text-sm font-medium text-slate-700 leading-tight">Thanh toán<br/>hàng tháng:</label>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-slate-500">Ngày</span>
                      <Input 
                        type="number" 
                        min="1" max="31"
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.paymentDate || "") : (selectedContract?.paymentDate || "")}
                        onChange={e => setEditForm({...editForm, paymentDate: e.target.value})}
                        className="bg-slate-100/50 border-slate-200 h-9 w-20 text-center" 
                      />
                    </div>
                  </div>
                </div>
                {/* Chi phí */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Chi phí & Dịch vụ</h3>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-y-3">
                    <label className="text-sm font-medium text-slate-700">Tiền cọc:</label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="number"
                        min="0"
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.deposit || "") : (selectedContract?.deposit || "")}
                        onChange={e => setEditForm({...editForm, deposit: Number(e.target.value)})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                      <span className="text-sm text-slate-500 min-w-[60px]">VNĐ</span>
                    </div>

                    <label className="text-sm font-medium text-slate-700">Tiền điện:</label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="number"
                        min="0"
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.electricityPrice || "") : (selectedContract?.electricityPrice || "")}
                        onChange={e => setEditForm({...editForm, electricityPrice: Number(e.target.value)})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                      <span className="text-sm text-slate-500 min-w-[60px]">.000/số</span>
                    </div>

                    <label className="text-sm font-medium text-slate-700">Tiền nước:</label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="number"
                        min="0"
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.waterPrice || "") : (selectedContract?.waterPrice || "")}
                        onChange={e => setEditForm({...editForm, waterPrice: Number(e.target.value)})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                      <span className="text-sm text-slate-500 min-w-[60px]">.000/khối</span>
                    </div>

                    <label className="text-sm font-medium text-slate-700">Wifi/Internet:</label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="number"
                        min="0"
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.wifiPrice || "") : (selectedContract?.wifiPrice || "")}
                        onChange={e => setEditForm({...editForm, wifiPrice: Number(e.target.value)})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                      <span className="text-sm text-slate-500 min-w-[60px]">.000/phòng</span>
                    </div>

                    <label className="text-sm font-medium text-slate-700">Gửi xe:</label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="number"
                        min="0"
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.parkingPrice || "") : (selectedContract?.parkingPrice || "")}
                        onChange={e => setEditForm({...editForm, parkingPrice: Number(e.target.value)})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                      <span className="text-sm text-slate-500 min-w-[60px]">.000/xe</span>
                    </div>

                    <label className="text-sm font-medium text-slate-700">Dịch vụ chung:</label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="number"
                        min="0"
                        readOnly={!isCreating && !isEditing} 
                        value={(isEditing || isCreating) ? (editForm.servicePrice || "") : (selectedContract?.servicePrice || "")}
                        onChange={e => setEditForm({...editForm, servicePrice: Number(e.target.value)})}
                        className="bg-slate-100/50 border-slate-200 h-9 flex-1" 
                      />
                      <span className="text-sm text-slate-500 min-w-[60px]">.000/người</span>
                    </div>
                  </div>
                </div>

                {/* Tài sản & Điều khoản */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Tài sản & Điều khoản</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Tài sản bàn giao:</label>
                      <textarea 
                        readOnly={!isCreating && !isEditing}
                        value={(isEditing || isCreating) ? (editForm.assets || "") : (selectedContract?.assets || "")}
                        onChange={e => setEditForm({...editForm, assets: e.target.value})}
                        className={`flex min-h-[100px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 ${(!isCreating && !isEditing) ? 'bg-slate-100/50' : 'bg-white'}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Điều khoản hợp đồng:</label>
                      <textarea 
                        readOnly={!isCreating && !isEditing}
                        value={(isEditing || isCreating) ? (editForm.terms || "") : (selectedContract?.terms || "")}
                        onChange={e => setEditForm({...editForm, terms: e.target.value})}
                        className={`flex min-h-[120px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 ${(!isCreating && !isEditing) ? 'bg-slate-100/50' : 'bg-white'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Xác nhận */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Xác nhận hợp đồng</h3>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-y-3 mb-4">
                    <label className="text-sm font-medium text-slate-700">Mã nhận phòng:</label>
                    <Input readOnly value={(isEditing || isCreating) ? (editForm.contractCode || "") : (selectedContract?.contractCode || "")} className="bg-slate-100/50 border-slate-200 h-9" />
                    
                    <label className="text-sm font-medium text-slate-700">Trạng thái:</label>
                    <Input readOnly value={(isEditing || isCreating) ? (editForm.status === 'active' ? 'Hoạt động' : '') : (selectedContract?.status === 'active' ? 'Hoạt động' : '')} className="bg-slate-100/50 border-slate-200 h-9" />
                    
                    <label className="text-sm font-medium text-slate-700">Ngày xác nhận:</label>
                    <Input type="date" readOnly value={(isEditing || isCreating) ? (editForm.createdAt?.split('T')[0] || "") : (selectedContract?.createdAt?.split('T')[0] || "")} className="bg-slate-100/50 border-slate-200 h-9" />
                  </div>

                  {(isCreating || isEditing) && (
                    <div className="pt-4 border-t flex justify-end gap-2">
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          const code = editForm.contractCode || `HD${Math.floor(Math.random() * 10000)}`;
                          setEditForm({
                            ...editForm,
                            contractCode: code,
                            status: 'active',
                            createdAt: new Date().toISOString()
                          });
                          toast.success(`Đã xác nhận tạo mã: ${code}`);
                        }}
                      >
                        Xác nhận hợp đồng
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white" 
                        disabled={!editForm.contractCode} 
                        onClick={handleSave}
                      >
                        Lưu
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setIsCreating(false);
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 p-8 text-center">
              <div>
                <Search className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                <p>Chọn một hợp đồng từ danh sách để xem chi tiết</p>
              </div>
            </div>
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
}
