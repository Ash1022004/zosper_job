# Fix Vercel 404 Login Error

## Problem
When logging in on Vercel, you see a 404 error because the frontend can't reach the backend API.

## Solution

### Step 1: Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

   **For Production:**
   - Key: `VITE_API_URL`
   - Value: `https://zosper-job-1.onrender.com` (or your Render backend URL)
   - Environment: **Production**

   **For Preview (optional):**
   - Key: `VITE_API_URL`
   - Value: `https://zosper-job-1.onrender.com`
   - Environment: **Preview**

   **For Development (optional):**
   - Key: `VITE_API_URL`
   - Value: `http://localhost:4000`
   - Environment: **Development**

4. Click **Save**

### Step 2: Configure Render Backend Environment Variables

1. Go to your Render dashboard
2. Select your backend service
3. Click **Environment** tab
4. Add/Update these variables:

   - Key: `ORIGIN`
   - Value: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - **Important**: Use the exact URL including `https://`

   - Key: `JWT_SECRET`
   - Value: `461e093188a6b2ab0616be006667870b5517649ee1bdf2f5b3bfdbd12557700f` (or your generated secret)

   - Key: `NODE_ENV`
   - Value: `production` (optional, but recommended)

5. Click **Save Changes**
6. Render will automatically redeploy

### Step 3: Redeploy Vercel

After adding environment variables in Vercel:

1. Go to **Deployments** tab in Vercel
2. Click the **3 dots** (⋮) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a redeploy

### Step 4: Verify

1. Visit your Vercel site
2. Try to log in
3. Check browser console (F12) for errors
4. Check Network tab to see if API calls go to `https://zosper-job-1.onrender.com`

---

## Important Notes

✅ **Backend URL**: Make sure your Render backend is running and accessible at `https://zosper-job-1.onrender.com`

✅ **CORS**: The backend is now configured to accept requests from your Vercel domain (set via `ORIGIN`)

✅ **Cookies**: Cookies are now configured for cross-domain (Vercel → Render) with `sameSite: 'none'` and `secure: true`

✅ **No trailing slash**: The API_URL should NOT have a trailing slash (e.g., `https://zosper-job-1.onrender.com` not `https://zosper-job-1.onrender.com/`)

---

## Troubleshooting

### Still getting 404?
- Check that `VITE_API_URL` is set correctly in Vercel
- Verify the backend URL is correct (visit `https://zosper-job-1.onrender.com/` in browser - should show API message)
- Check browser console for the exact URL being called

### CORS errors?
- Verify `ORIGIN` in Render is set to your exact Vercel URL (with `https://`)
- Make sure both frontend and backend are using HTTPS in production

### Cookies not working?
- Make sure backend has `ORIGIN` set correctly
- Check that backend is using HTTPS (Render uses HTTPS by default)
- Check browser console for cookie errors

### Backend not accessible?
- Check Render dashboard - service should be "Live"
- Visit `https://zosper-job-1.onrender.com/` directly - should show API message
- Check Render logs for errors

---

## Quick Checklist

- [ ] `VITE_API_URL` set in Vercel (Production environment)
- [ ] `ORIGIN` set in Render (your Vercel URL)
- [ ] `JWT_SECRET` set in Render
- [ ] Both services redeployed after adding env vars
- [ ] Backend accessible at Render URL
- [ ] Frontend accessible at Vercel URL
- [ ] No trailing slash in `VITE_API_URL`

