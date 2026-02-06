# 🚀 Run These Commands in Your Terminal

You're authenticated! Now run these commands **in the same terminal where you logged in**.

---

## Step 1: Deploy Backend to Railway (2 minutes)

```bash
cd backend
railway init
railway up
railway domain
cd ..
```

**Copy the Railway URL that appears!** (e.g., `https://your-app.up.railway.app`)

---

## Step 2: Deploy Frontend to Vercel (2 minutes)

Replace `YOUR_RAILWAY_URL` with the URL from Step 1:

```bash
cd frontend
vercel --prod -e NEXT_PUBLIC_API_URL=YOUR_RAILWAY_URL/api/v1
cd ..
```

**Copy the Vercel URL that appears!** (e.g., `https://your-app.vercel.app`)

---

## Step 3: Update CORS (1 minute)

Replace `YOUR_VERCEL_URL` with the URL from Step 2:

```bash
cd backend
railway variables set CORS_ORIGINS=YOUR_VERCEL_URL,https://*.vercel.app
cd ..
```

---

## Step 4: Set Database URL (1 minute)

You need a Neon Postgres database. Quick setup:

1. Go to https://neon.tech
2. Create account → Create project
3. Copy connection string
4. Change `postgresql://` to `postgresql+asyncpg://`
5. Run:

```bash
cd backend
railway variables set DATABASE_URL=postgresql+asyncpg://YOUR_NEON_CONNECTION_STRING
cd ..
```

---

## ✅ Done!

Your app is now live at:
- **Frontend**: YOUR_VERCEL_URL
- **Backend**: YOUR_RAILWAY_URL
- **API Docs**: YOUR_RAILWAY_URL/docs

---

## 📋 Quick Checklist

- [ ] Run `cd backend && railway init && railway up && railway domain`
- [ ] Copy Railway URL
- [ ] Run `cd ../frontend && vercel --prod -e NEXT_PUBLIC_API_URL=<railway-url>/api/v1`
- [ ] Copy Vercel URL
- [ ] Run `cd ../backend && railway variables set CORS_ORIGINS=<vercel-url>`
- [ ] Create Neon database and set DATABASE_URL
- [ ] Test your app!

---

**Paste your URLs here when done and I'll help you test!**
