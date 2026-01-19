# Deploy to Vercel

## Quick Deploy Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Sign in with GitHub

3. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Configure Build Settings** (usually auto-detected):
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build` (from vercel.json)
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --include=dev` (from vercel.json)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Important Notes:

✅ **No environment variables needed** - Everything is hardcoded in `lib/config.ts`

✅ **MongoDB Connection**: 
   - Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
   - Or add Vercel's IP ranges to your MongoDB whitelist

✅ **NextAuth Configuration**:
   - NEXTAUTH_URL is auto-detected by Vercel
   - Secret is hardcoded in `lib/config.ts`

## Troubleshooting:

If deployment fails:

1. **Check Build Logs** in Vercel dashboard for specific errors
2. **MongoDB Connection Issues**:
   - Ensure MongoDB Atlas Network Access allows 0.0.0.0/0
   - Verify connection string in `lib/config.ts` is correct
3. **Prisma Issues**:
   - Make sure `prisma generate` runs (it's in the build command)
   - Check that `DATABASE_URL` in `prisma/schema.prisma` matches `lib/config.ts`
4. **Build Errors**:
   - Test locally: `npm run build`
   - Check that all dependencies are in `package.json`

## Current Configuration:

- **Database**: MongoDB Atlas (hardcoded in `lib/config.ts`)
- **Auth**: NextAuth.js (hardcoded secret in `lib/config.ts`)
- **Build**: Configured in `vercel.json`

Your project is ready to deploy! 🚀

