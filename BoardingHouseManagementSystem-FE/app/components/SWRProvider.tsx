"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/apiClient";
import React from "react";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false, // Không load lại khi focus tab
        revalidateIfStale: false, // Tùy chọn: không load lại nếu data đã có sẵn (hoặc có thể giữ mặc định để SWR tự cập nhật ngầm)
        dedupingInterval: 60000, // Cùng 1 URL, trong 60s chỉ gọi API đúng 1 lần dù component mount lại bao nhiêu lần
      }}
    >
      {children}
    </SWRConfig>
  );
}
