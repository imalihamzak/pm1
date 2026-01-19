// Set environment variables BEFORE importing NextAuth
import { config } from "@/lib/config";

if (typeof process !== 'undefined') {
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = config.nextAuthSecret;
  }
  if (!process.env.NEXTAUTH_URL) {
    if (process.env.VERCEL_URL) {
      process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
    } else {
      process.env.NEXTAUTH_URL = config.nextAuthUrl || 'http://localhost:3000';
    }
  }
}

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
