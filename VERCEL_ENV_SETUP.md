# Vercel Environment Variables Setup

## Required Environment Variables

To fix the login issue on Vercel, make sure you have these environment variables set in your Vercel project:

### 1. NEXTAUTH_URL
- **Value**: Your production domain (e.g., `https://your-app.vercel.app`)
- **Where to set**: Vercel Dashboard → Your Project → Settings → Environment Variables
- **Important**: Make sure it matches your actual Vercel deployment URL (without trailing slash)

### 2. NEXTAUTH_SECRET
- **Value**: A random string (generate one using: `openssl rand -base64 32`)
- **Where to set**: Same as above
- **Important**: This must be a strong, random secret. Do NOT use the development fallback value.

### 3. DATABASE_URL
- **Value**: Your MongoDB connection string
- **Where to set**: Same as above
- **Example**: `mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority`

## Steps to Fix:

1. Go to your Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add/Update these variables:
   - `NEXTAUTH_URL` = `https://your-actual-vercel-url.vercel.app`
   - `NEXTAUTH_SECRET` = (generate a new random string)
   - `DATABASE_URL` = (your MongoDB connection string)
5. **Redeploy** your application after adding/updating variables

## Generate NEXTAUTH_SECRET:

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

## After Updating:

1. Trigger a new deployment (or push a new commit)
2. Wait for deployment to complete
3. Test the login again

## Debugging:

If login still doesn't work:
1. Check Vercel Function Logs in the dashboard
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Make sure NEXTAUTH_URL matches your actual deployment URL exactly

