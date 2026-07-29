"use client";

import React from "react";
import { Tenant } from "../types";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Phone, Mail, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TenantTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

export function TenantTable({ tenants, onEdit, onDelete }: TenantTableProps) {
  if (tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Chưa có khách thuê nào</h3>
        <p className="text-slate-500">Bạn chưa thêm khách thuê nào vào hệ thống.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Khách thuê</th>
              <th className="px-6 py-4">Liên hệ</th>
              <th className="px-6 py-4">Giấy tờ (CCCD)</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Ngày tham gia</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      {tenant.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tenant.avatarUrl} alt={tenant.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm">
                          {tenant.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-1">{tenant.fullName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      {tenant.phone}
                    </div>
                    {tenant.email && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span className="line-clamp-1">{tenant.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {tenant.cccdNumber ? (
                    <div className="flex items-center text-sm text-slate-600">
                      <CreditCard className="w-4 h-4 mr-2 text-slate-400" />
                      {tenant.cccdNumber}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Chưa cập nhật</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={tenant.isActive === false ? "destructive" : "default"} className={tenant.isActive !== false ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                    {tenant.isActive !== false ? "Đang thuê" : "Đã rời đi"}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {tenant.createdAt ? format(new Date(tenant.createdAt), 'dd MMM, yyyy', { locale: vi }) : "N/A"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tenant)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tenant)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
