export type UserRole = "ADMIN" | "LANDLORD" | "TENANT";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  role: UserRole;
  accessToken: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Omit<AuthenticatedUser, "accessToken">;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
}
