import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { LoginResponse } from "@/types/auth";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Spring Boot credentials",
      credentials: {
        identifier: { label: "Email hoặc số điện thoại", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password || !apiBaseUrl) return null;
        const response = await fetch(`${apiBaseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: credentials.identifier, password: credentials.password }),
          cache: "no-store",
        });
        
        if (!response.ok) {
           console.log("Login failed with status: ", response.status);
           return null;
        }
        
        const payload = (await response.json()) as LoginResponse;
        if (!payload.accessToken || !payload.user?.id || !payload.user.role) return null;
        return { 
          id: payload.user.id.toString(), 
          name: payload.user.name, 
          email: payload.user.email, 
          role: payload.user.role, 
          phoneNumber: payload.user.phoneNumber, 
          accessToken: payload.accessToken 
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role; token.accessToken = user.accessToken; token.phoneNumber = user.phoneNumber; }
      return token;
    },
    async session({ session, token }) {
      if (token.id && token.role && token.accessToken) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phoneNumber = token.phoneNumber;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};
