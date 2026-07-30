"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TenantTable } from "./_components/TenantTable";
import { TenantModal } from "./_components/TenantModal";
import { DeleteConfirmDialog } from "./_components/DeleteConfirmDialog";
import { QuickContractModal } from "./_components/QuickContractModal";
import { Tenant } from "./types";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import Link from "next/link";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractTenant, setContractTenant] = useState<Tenant | null>(null);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/tenants");
      // Cấu trúc response có thể nằm trong .data.data tùy backend (thường là ApiResponse.success)
      const data = response.data?.data || response.data || [];
      setTenants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khách thuê:", error);
      toast.error("Không thể tải danh sách khách thuê");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleAddClick = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDeleteDialogOpen(true);
  };

  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return tenants;
    const lowerQuery = searchQuery.toLowerCase();
    return tenants.filter(
      (t) =>
        t.fullName.toLowerCase().includes(lowerQuery) ||
        t.phone.includes(lowerQuery) ||
        (t.email && t.email.toLowerCase().includes(lowerQuery))
    );
  }, [tenants, searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/landlord/dashboard" className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-slate-50 rounded-full shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Quản lý Khách thuê
            </h1>
            <p className="text-slate-500 mt-1">Quản lý thông tin liên hệ và giấy tờ của tất cả khách thuê trong hệ thống.</p>
          </div>
        </div>
        
        <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 h-11 px-6 shadow-sm shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Thêm khách thuê
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 w-full bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
          
          <div className="text-sm text-slate-500 font-medium">
            Hiển thị <span className="text-slate-900">{filteredTenants.length}</span> khách thuê
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            Đang tải dữ liệu...
          </div>
        ) : (
          <TenantTable
            tenants={filteredTenants}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Modals */}
      <TenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenant={selectedTenant}
        onSuccess={(savedTenant, openContract) => {
          fetchTenants();
          if (openContract && savedTenant) {
            setContractTenant(savedTenant);
            setIsContractModalOpen(true);
          }
        }}
      />
      
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        tenant={selectedTenant}
        onSuccess={fetchTenants}
      />

      <QuickContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        tenant={contractTenant}
        onSuccess={fetchTenants}
      />
    </div>
  );
}

