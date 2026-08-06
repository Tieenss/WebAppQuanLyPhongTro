export interface Tenant {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  createdAt: string;
  cccdNumber: string | null;
  cccdFrontImg: string | null;
  cccdBackImg: string | null;
  isActive: boolean | null;
}

export interface TenantRequest {
  fullName: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  cccdNumber: string | null;
  cccdFrontImg: string | null;
  cccdBackImg: string | null;
  isActive: boolean;
}
