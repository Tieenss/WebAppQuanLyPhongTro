"use client";

import axios, { type AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import type { ApiErrorResponse } from "@/types/auth";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) config.headers.Authorization = `Bearer ${session.accessToken}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const message = error.response?.data?.message ?? error.response?.data?.error ?? "Không thể kết nối tới máy chủ.";
    if (error.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      await signOut({ callbackUrl: "/login" });
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
