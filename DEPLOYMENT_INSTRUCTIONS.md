# 🚀 Deployment Guide - Vercel + Hugging Face

## Overview
- **Frontend**: Vercel (Next.js)
- **Backend**: Hugging Face Spaces (FastAPI)
- **Database**: SQLite (included) or PostgreSQL (optional)

---

## Part 1: Deploy Backend to Hugging Face Spaces

### Step 1: Create a Hugging Face Account
1. Go to https://huggingface.co/join
2. Sign up (free account)
3. Verify your email

### Step 2: Create a New Space
1. Go to https://huggingface.co/new-space
2. Fill in the details:
   - **Space name**: `todo-app-backend` (or any name you prefer)
   - **License**: MIT
   - **Select SDK**: Docker
   - **Space hardware**: CPU basic (free)
   - **Visibility**: Public
3. Click **"Create Space"**

### Step 3: Upload Backend Files

You have two options:

#### Option A: Using Git (Recommended)

```bash
# Navigate to backend directory
cd backend

# Initialize git if not already done
git init

# Add Hugging Face Space as remote
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/todo-app-backend

# Create a README.md for Hugging Face
cp README_HF.md README.md

# Add all files
git add .

# Commit
git commit -m "Initial deployment to Hugging Face"

# Push to Hugging Face
git push hf main
```

#### Option B: Using Web Interface

1. In your Space page, click **"Files"** tab
2. Click **"Add file"** → **"Upload files"**
3. Upload these files from the `backend` folder:
   - `Dockerfile`
   - `requirements.txt`
   - `app/` (entire folder)
   - `alembic/` (entire folder)
   - `alembic.ini`
   - Create a `README.md` (copy content from `README_HF.md`)

### Step 4: Configure Environment Variables (Optional)

1. In your Space, go to **"Settings"** tab
2. Scroll to **"Variables and secrets"**
3. Add these variables:
   - `CORS_ORIGINS`: `*` (we'll update this after Vercel deployment)
   - `DATABASE_URL`: (optional - leave empty to use SQLite)

### Step 5: Wait for Build

1. Go to **"Logs"** tab
2. Wait for the build to complete (2-5 minutes)
3. Once you see "Application startup complete", your backend is live!

### Step 6: Get Your Backend URL

Your backend URL will be:
```
https://YOUR_USERNAME-todo-app-backend.hf.space
```

**Test it:**
- Visit: `https://YOUR_USERNAME-todo-app-backend.hf.space`
- You should see: `{"message":"Todo API v2.0.0",...}`
- API Docs: `https://YOUR_USERNAME-todo-app-backend.hf.space/docs`

**Save this URL - you'll need it for Vercel!**

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Login to Vercel (Already Done)

You should have already completed `vercel login`.

### Step 2: Update Frontend Environment Variable

Update the API URL to point to your Hugging Face backend:

```bash
cd frontend
```

Create/update `.env.production`:
```bash
echo "NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-todo-app-backend.hf.space/api/v1" > .env.production
```

Replace `YOUR_USERNAME-todo-app-backend` with your actual Hugging Face Space URL.

### Step 3: Deploy to Vercel

```bash
# Make sure you're in the frontend directory
cd frontend

# Deploy to production
vercel --prod --yes
```

**What happens:**
1. Vercel will ask a few questions (accept defaults)
2. It will build your Next.js app
3. It will deploy to production
4. You'll get a URL like: `https://your-app.vercel.app`

### Step 4: Get Your Frontend URL

After deployment completes, you'll see:
```
✅ Production: https://your-app-xxxxx.vercel.app
```

**Save this URL!**

---

## Part 3: Update CORS Settings

### Update Hugging Face Backend CORS

1. Go to your Hugging Face Space
2. Click **"Settings"** tab
3. Find **"Variables and secrets"**
4. Update `CORS_ORIGINS` to:
   ```
   https://your-app-xxxxx.vercel.app,https://*.vercel.app
   ```
   (Replace with your actual Vercel URL)
5. Click **"Save"**
6. The Space will automatically restart

---

## Part 4: Test Your Deployment

### Test Backend
1. Visit: `https://YOUR_USERNAME-todo-app-backend.hf.space/docs`
2. Try the **GET /api/v1/tasks** endpoint
3. Should return an empty array: `[]`

### Test Frontend
1. Visit: `https://your-app-xxxxx.vercel.app`
2. Click **"+ New Task"**
3. Create a test task:
   - Title: "Test Production"
   - Description: "Testing deployment"
   - Priority: High
4. Click **"Create Task"**
5. Task should appear in the list

### Test Full Integration
- ✅ Create a task
- ✅ Mark as complete
- ✅ Edit task
- ✅ Delete task
- ✅ Search tasks
- ✅ Filter by status/priority

---

## 🎉 Deployment Complete!

### Your Live URLs:

**Frontend (Vercel):**
```
https://your-app-xxxxx.vercel.app
```

**Backend (Hugging Face):**
```
https://YOUR_USERNAME-todo-app-backend.hf.space
```

**API Documentation:**
```
https://YOUR_USERNAME-todo-app-backend.hf.space/docs
```

---

## 📊 Free Tier Limits

### Hugging Face Spaces (Free)
- ✅ CPU basic (2 vCPU, 16GB RAM)
- ✅ Unlimited requests
- ✅ Auto-sleep after 48h inactivity (wakes on request)
- ✅ Public spaces only

### Vercel (Free)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Preview deployments

**Total Cost: $0/month**

---

## 🔧 Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: CORS errors in browser console

**Solution**:
1. Check Hugging Face Space settings
2. Verify `CORS_ORIGINS` includes your Vercel URL
3. Restart the Space (Settings → Restart)

### Backend Not Starting

**Problem**: Hugging Face Space shows error

**Solution**:
1. Check **"Logs"** tab for errors
2. Verify `Dockerfile` is correct
3. Check `requirements.txt` has all dependencies
4. Rebuild: Settings → Factory Reboot

### Tasks Not Persisting

**Problem**: Tasks disappear after refresh

**Solution**:
1. Check backend logs for database errors
2. Verify SQLite file is being created
3. For production, consider using PostgreSQL (add `DATABASE_URL`)

---

## 🚀 Next Steps

### Optional Enhancements:

1. **Custom Domain**:
   - Vercel: Settings → Domains → Add Domain
   - Hugging Face: Upgrade to Pro for custom domains

2. **Database Upgrade**:
   - Use Neon PostgreSQL (free tier)
   - Add `DATABASE_URL` to Hugging Face Space settings

3. **Monitoring**:
   - Hugging Face: Built-in logs and metrics
   - Vercel: Analytics dashboard

4. **CI/CD**:
   - GitHub Actions for automated deployments
   - Auto-deploy on push to main

---

## 📝 Quick Reference

### Redeploy Frontend
```bash
cd frontend
vercel --prod --yes
```

### Redeploy Backend
```bash
cd backend
git push hf main
```

### View Logs
- **Frontend**: Vercel Dashboard → Your Project → Deployments → View Logs
- **Backend**: Hugging Face Space → Logs tab

---

**Need help?** Check the troubleshooting section or visit:
- Vercel Docs: https://vercel.com/docs
- Hugging Face Docs: https://huggingface.co/docs/hub/spaces
