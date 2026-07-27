import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserRole } from "@/types/auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: DefaultSession["user"] & { id: string; role: UserRole; phoneNumber?: string | null };
  }

  interface User {
    id: string;
    role: UserRole;
    accessToken: string;
    phoneNumber?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    accessToken?: string;
    phoneNumber?: string | null;
  }
}
