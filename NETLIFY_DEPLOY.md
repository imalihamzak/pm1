# Deploy to Netlify

## Steps to Deploy:

1. **Push your code to GitHub** (if not already done)

2. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Sign up/login if needed

3. **Import your project**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository

4. **Configure Build Settings** (should auto-detect, but verify):
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (or leave blank, the plugin handles it)
   - **Node version**: `18` (should auto-detect from netlify.toml)

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete

## Important Notes:

- The `@netlify/plugin-nextjs` plugin will handle Next.js routing automatically
- All your API routes will work as serverless functions
- Your MongoDB connection should work (ensure your MongoDB Atlas allows connections from Netlify's IPs)
- No environment variables needed - everything is hardcoded in `lib/config.ts`

## Troubleshooting:

If you encounter issues:
1. Check the build logs in Netlify dashboard
2. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Netlify IPs
3. Verify the build completes successfully locally with `npm run build`

## Alternative: Fix Vercel Instead

If you want to fix Vercel (recommended for Next.js):
- Check Vercel build logs for errors
- Ensure MongoDB Atlas allows Vercel IPs
- Make sure all dependencies are listed in package.json

