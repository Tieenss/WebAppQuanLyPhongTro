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
import apiClient, { fetcher } from "@/lib/apiClient";
import { toast } from "sonner";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractTenant, setContractTenant] = useState<Tenant | null>(null);

  const { data: swrTenants, isLoading } = useSWR('/tenants', fetcher);
  const { mutate } = useSWRConfig();
  
  const tenants = useMemo<Tenant[]>(() => {
    if (!swrTenants) return [];
    return Array.isArray(swrTenants) ? swrTenants : (swrTenants.data || []);
  }, [swrTenants]);

  const handleSuccess = () => {
    mutate('/tenants');
  };

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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Link href="/landlord/management" className="text-slate-400 hover:text-blue-600 transition-colors mt-1 sm:mt-0">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý khách thuê</h1>
            <p className="mt-1 text-sm text-slate-500">Quản lý thông tin liên hệ và giấy tờ của tất cả khách thuê trong hệ thống.</p>
          </div>
        </div>
        
        <button 
          onClick={handleAddClick} 
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm khách thuê</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm khách thuê..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
          handleSuccess();
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
        onSuccess={handleSuccess}
      />

      <QuickContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        tenant={contractTenant}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

