"use client";

import { useState, useEffect } from "react";
import { FileText, Key, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TenantContractPage() {
  const [contractCode, setContractCode] = useState("");
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const { update } = useSession(); // To update session if role changes
  const router = useRouter();

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/contracts');
      let rawData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setContracts(rawData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleJoinContract = async () => {
    if (!contractCode.trim()) {
      return toast.error("Vui lòng nhập mã hợp đồng");
    }
    
    try {
      setIsJoining(true);
      await apiClient.post(`/contracts/join/${contractCode.trim()}`);
      toast.success("Xác nhận hợp đồng thành công!");
      
      // Update session if they were guest and are now tenant
      await update();
      
      setContractCode("");
      fetchContracts();
      
      // Reload page to reflect new roles and sidebar links
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Mã hợp đồng không hợp lệ hoặc đã có người thuê";
      toast.error(msg);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Nhập mã Hợp đồng */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Nhập Mã Hợp Đồng</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Nếu bạn được chủ trọ cung cấp một mã hợp đồng cho phòng trống, vui lòng nhập vào bên dưới để xác nhận thông tin và trở thành người thuê phòng.
          </p>
          
          <div className="flex flex-col md:flex-row max-w-md mx-auto gap-3">
            <Input
              placeholder="Ví dụ: HD-P101-123456"
              value={contractCode}
              onChange={(e) => setContractCode(e.target.value)}
              className="rounded-xl h-12 text-center md:text-left text-lg tracking-wider bg-slate-50 border-slate-200 focus-visible:ring-primary"
            />
            <Button
              onClick={handleJoinContract}
              disabled={isJoining}
              className="rounded-xl h-12 px-8 bg-primary hover:bg-blue-600 shadow-md shadow-blue-200 w-full md:w-auto"
            >
              {isJoining ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </div>
        </div>

        {/* Danh sách Hợp đồng hiện tại */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-bold text-slate-800">Hợp đồng của tôi</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10 text-slate-400">Đang tải dữ liệu...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
              Bạn chưa có hợp đồng nào.
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map(c => (
                <div key={c.id} className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 hover:border-blue-100 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">Phòng {c.roomNumber}</h3>
                      <p className="text-sm text-slate-500">Mã: <span className="font-mono text-primary font-medium">{c.contractCode}</span></p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {c.status === "active" ? (
                         <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                           <CheckCircle className="w-4 h-4 mr-1" /> Đang hiệu lực
                         </span>
                      ) : (
                         <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                           Đã kết thúc
                         </span>
                      )}
                      <Button variant="outline" onClick={() => window.alert("Chức năng tải PDF đang hoàn thiện")} className="rounded-full bg-white">
                        <Download className="w-4 h-4 mr-2" />
                        Tải PDF
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Thời gian thuê</p>
                      <p className="text-sm font-medium text-slate-800">{c.startDate} đến {c.endDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Giá thuê/tháng</p>
                      <p className="text-sm font-medium text-slate-800">{c.rentalPrice?.toLocaleString()}đ</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Tiền cọc</p>
                      <p className="text-sm font-medium text-slate-800">{c.deposit?.toLocaleString()}đ</p>
                    </div>
                  </div>
                  
                  {c.terms && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-2">Điều khoản chung</p>
                      <div className="bg-white p-3 rounded-xl text-xs text-slate-600 whitespace-pre-wrap border border-slate-100">
                        {c.terms}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
