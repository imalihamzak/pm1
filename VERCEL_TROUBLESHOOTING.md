# Vercel Deployment Troubleshooting

## Common Issues and Solutions

### Issue: NextAuth Configuration Error on Vercel

**Symptoms:**
- Works fine locally
- Fails on Vercel with `[next-auth][error][NO_SECRET]` or `[next-auth][warn][NEXTAUTH_URL]`

**Solution:**
The project now automatically sets environment variables. However, if issues persist:

1. **Check Vercel Build Logs:**
   - Go to your Vercel dashboard
   - Click on your deployment
   - Check the "Build Logs" and "Function Logs"
   - Look for NextAuth errors

2. **Verify MongoDB Connection:**
   - Ensure MongoDB Atlas Network Access allows `0.0.0.0/0` (all IPs)
   - Or add Vercel's IP ranges to whitelist
   - Check MongoDB connection string in `lib/config.ts`

3. **Check Environment Variables:**
   - Even though we hardcode everything, verify no conflicting env vars in Vercel dashboard
   - Go to: Project Settings → Environment Variables
   - Make sure there are no old/conflicting values

### Debug Steps:

1. **Enable Debug Mode (temporarily):**
   - In `lib/auth-config.ts`, change `debug: false` to `debug: true`
   - This will show detailed logs in Vercel Function Logs

2. **Check Vercel Function Logs:**
   - Vercel Dashboard → Your Project → Functions tab
   - Click on any function and check logs
   - Look for NextAuth initialization messages

3. **Test the API Route Directly:**
   - Visit: `https://your-app.vercel.app/api/auth/providers`
   - This should return providers without errors

### If Still Not Working:

1. **Check Vercel URL Format:**
   - Vercel provides `VERCEL_URL` environment variable
   - It should be something like: `your-app-abc123.vercel.app`
   - The code automatically adds `https://` prefix

2. **Redeploy:**
   - Sometimes a fresh deployment fixes issues
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" on the latest deployment

3. **Clear Build Cache:**
   - Vercel Dashboard → Project Settings → General
   - Scroll to "Clear Build Cache"
   - Clear and redeploy

## Current Configuration:

- ✅ Environment variables are set automatically
- ✅ Works with Vercel's `VERCEL_URL`
- ✅ Falls back to localhost for local development
- ✅ No manual environment variable setup needed

## Still Having Issues?

Share the error messages from:
- Vercel Build Logs
- Vercel Function Logs  
- Browser console errors

