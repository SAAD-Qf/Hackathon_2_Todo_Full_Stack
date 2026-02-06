# ⚡ Quick Deploy Checklist - 60 Minutes

Follow these steps in order. Each step has a time estimate.

## ✅ Pre-Deployment (5 min)

- [ ] Code is committed to Git
- [ ] Code is pushed to GitHub
- [ ] You have accounts on: Neon, Railway, Vercel

---

## 🗄️ Step 1: Database Setup (10 min)

### Neon Postgres

1. Go to https://neon.tech → Sign up
2. Create Project → Name: `todo-app-db`
3. Copy connection string
4. Change `postgresql://` to `postgresql+asyncpg://`
5. Save it somewhere safe

**Your connection string should look like:**
```
postgresql+asyncpg://user:pass@ep-xxx.region.aws.neon.tech/neondb
```

---

## 🚂 Step 2: Backend Deploy (20 min)

### Railway

1. Go to https://railway.app → Sign up with GitHub
2. New Project → Deploy from GitHub repo
3. Select your repository
4. Add Environment Variables:
   ```
   DATABASE_URL = [paste your Neon connection string]
   CORS_ORIGINS = https://your-app.vercel.app,https://your-app-*.vercel.app
   ENVIRONMENT = production
   ```
5. Settings → Generate Domain
6. **Copy your Railway URL** (e.g., `https://todo-api-production-xxxx.up.railway.app`)
7. Test it: Open `[your-railway-url]/health` in browser

**Expected response:**
```json
{"status":"healthy","version":"2.0.0"}
```

---

## 🎨 Step 3: Frontend Deploy (15 min)

### Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. New Project → Import your repository
3. Root Directory: `frontend` (if needed)
4. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL = [your-railway-url]/api/v1
   ```
   Example: `https://todo-api-production-xxxx.up.railway.app/api/v1`
5. Deploy
6. **Copy your Vercel URL** (e.g., `https://todo-app-xxxx.vercel.app`)

---

## 🔄 Step 4: Update CORS (5 min)

### Back to Railway

1. Railway Dashboard → Your Service → Variables
2. Update `CORS_ORIGINS` with your actual Vercel URL:
   ```
   CORS_ORIGINS = https://todo-app-xxxx.vercel.app,https://todo-app-*-xxxx.vercel.app
   ```
3. Service will auto-redeploy (wait 2 min)

---

## ✅ Step 5: Test Everything (10 min)

### Test Checklist

1. Open your Vercel URL
2. Click "+ New Task"
3. Create a task:
   - Title: "Production Test"
   - Priority: High
   - Click Create
4. Task appears? ✅
5. Mark it complete? ✅
6. Delete it? ✅

### If something doesn't work:

**Check Browser Console (F12)**
- CORS error? → Update Railway CORS_ORIGINS
- API error? → Check Railway logs
- Nothing loads? → Check Vercel logs

**Check Railway Logs**
- Railway Dashboard → Deployments → View Logs
- Look for errors

**Check Vercel Logs**
- Vercel Dashboard → Deployments → View Function Logs
- Look for errors

---

## 🎉 Success!

### Your Live URLs:

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://your-api.railway.app`
**API Docs**: `https://your-api.railway.app/docs`

---

## 🆘 Common Issues

### "Failed to fetch" error

**Problem**: Frontend can't reach backend

**Fix**:
1. Check `NEXT_PUBLIC_API_URL` in Vercel
2. Check `CORS_ORIGINS` in Railway
3. Make sure both include `/api/v1` correctly

### "Database connection failed"

**Problem**: Backend can't reach Neon

**Fix**:
1. Check `DATABASE_URL` starts with `postgresql+asyncpg://`
2. Verify Neon database is active
3. Check Railway logs for exact error

### "502 Bad Gateway"

**Problem**: Railway service crashed

**Fix**:
1. Check Railway logs
2. Verify all environment variables are set
3. Try redeploying

---

## 📱 Share Your App

Once everything works:

1. Share your Vercel URL with others
2. They can use the app immediately
3. No login required (Phase 2)

---

## 💡 Pro Tips

1. **Bookmark your dashboards**:
   - Railway: https://railway.app/dashboard
   - Vercel: https://vercel.com/dashboard
   - Neon: https://console.neon.tech

2. **Monitor your app**:
   - Check Railway logs daily
   - Watch Vercel analytics
   - Monitor Neon usage

3. **Free tier limits**:
   - Railway: $5/month credit
   - Vercel: 100GB bandwidth
   - Neon: 0.5GB storage

---

**Total Time**: ~60 minutes
**Difficulty**: Easy
**Cost**: $0 (free tiers)
