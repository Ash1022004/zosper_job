# Deployment Guide

## Backend Deployment (Render)

### Step 1: Configure Render Service

1. **Repository**: Connect to `https://github.com/Ash1022004/zosper_job`
2. **Root Directory**: Leave **EMPTY** (or set to `.`)
   - ❌ **WRONG**: `/opt/render/project/src/zosper_job/server`
   - ✅ **CORRECT**: (empty)
3. **Build Command**: `npm install`
4. **Start Command**: `npm run server`
5. **Environment**: `Node`

### Step 2: Environment Variables

Add these in Render's Environment Variables section:

- `ORIGIN` = Your frontend URL (e.g., `https://your-frontend.vercel.app`)
- `JWT_SECRET` = Generate a secure random string (e.g., `openssl rand -hex 32`)
- `PORT` = (Auto-set by Render, don't override)

### Step 3: Persistent Disk (Optional but Recommended)

⚠️ **Important**: Render's filesystem is ephemeral. Your `users.json` and `analytics.json` files will be **deleted** on every redeploy unless you use a Persistent Disk.

**Option A: Use Render Persistent Disk (Paid)**
- Add a Persistent Disk in Render
- Mount it to `/opt/render/project/server` or similar
- Update `server/store.cjs` to use the mounted path

**Option B: Migrate to Database (Recommended for Production)**
- Use PostgreSQL (Render provides free tier)
- Use MongoDB Atlas (free tier)
- Or any other database service

### Step 4: Update CORS for Production

The current CORS configuration in `server/index.cjs` will work, but make sure to set the `ORIGIN` environment variable to your exact frontend URL.

---

## Frontend Deployment (Vercel/Netlify)

### Step 1: Build Settings

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Install Command**: `npm install`

### Step 2: Environment Variables

Add:
- `VITE_API_URL` = Your Render backend URL (e.g., `https://your-backend.onrender.com`)

### Step 3: Update Frontend API URL

Make sure `src/lib/api.ts` uses the environment variable:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

---

## Testing After Deployment

1. ✅ Backend health check: Visit `https://your-backend.onrender.com/` (should show API message)
2. ✅ Frontend loads correctly
3. ✅ Admin login works (credentials: `ashish29133@gmail.com` / `123#Ashish`)
4. ✅ User registration works
5. ✅ Jobs display correctly
6. ✅ Application tracking works

---

## Troubleshooting

### Error: "Service Root Directory is missing"
- **Solution**: Set Root Directory to empty (`.`) in Render settings

### Error: "Cannot find module"
- **Solution**: Make sure `npm install` runs in Build Command

### Error: "Port already in use"
- **Solution**: Render sets PORT automatically, don't override it

### Data gets deleted on redeploy
- **Solution**: Use Persistent Disk or migrate to a database

