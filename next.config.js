/** @type {import('next').NextConfig} */

// Set NextAuth environment variables before Next.js starts
// These values must match lib/config.ts
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'development-secret-key-change-in-production-use-random-string';
}
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else {
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  }
}

const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
