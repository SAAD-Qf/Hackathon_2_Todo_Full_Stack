# 🚀 Production Deployment Guide - Phase 2

Complete guide to deploy your Todo application to production in under 2 hours.

## 📋 Prerequisites

Before starting, create accounts on:
1. **Neon** (Database): https://neon.tech - Free tier
2. **Railway** (Backend): https://railway.app - Free tier ($5 credit)
3. **Vercel** (Frontend): https://vercel.com - Free tier

## ⏱️ Estimated Time: 60-90 minutes

---

## Step 1: Set Up Neon Postgres Database (10 minutes)

### 1.1 Create Neon Account
1. Go to https://neon.tech
2. Sign up with GitHub (recommended) or email
3. Verify your email

### 1.2 Create Database
1. Click **"Create Project"**
2. Project name: `todo-app-db`
3. Region: Choose closest to you (e.g., US East, EU West)
4. Postgres version: 16 (default)
5. Click **"Create Project"**

### 1.3 Get Connection String
1. In your Neon dashboard, click on your project
2. Go to **"Connection Details"**
3. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb
   ```
4. **IMPORTANT**: Change `postgresql://` to `postgresql+asyncpg://`
5. Save this - you'll need it for Railway

**Example**:
```
Original: postgresql://user:pass@host/db
Modified: postgresql+asyncpg://user:pass@host/db
```

---

## Step 2: Deploy Backend to Railway (20 minutes)

### 2.1 Prepare Repository
1. Make sure your code is committed to Git:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   ```

2. Push to GitHub (if not already):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### 2.2 Deploy to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository
6. Railway will auto-detect it's a Python app

### 2.3 Configure Environment Variables

1. In Railway dashboard, click on your service
2. Go to **"Variables"** tab
3. Add these variables:

   ```
   DATABASE_URL = postgresql+asyncpg://[YOUR_NEON_CONNECTION_STRING]
   CORS_ORIGINS = https://your-app.vercel.app,https://your-app-*.vercel.app
   ENVIRONMENT = production
   PORT = 8000
   ```

4. Click **"Deploy"**

### 2.4 Get Your Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy your Railway URL (e.g., `https://your-app.up.railway.app`)
5. **Save this URL** - you'll need it for Vercel

### 2.5 Run Database Migrations

1. In Railway dashboard, go to your service
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Click **"View Logs"**
5. Verify the app started successfully

**Note**: The database tables will be created automatically on first run.

### 2.6 Test Backend

1. Open your Railway URL in browser: `https://your-app.up.railway.app`
2. You should see: `{"message":"Todo API v2.0.0",...}`
3. Test API docs: `https://your-app.up.railway.app/docs`
4. Test health: `https://your-app.up.railway.app/health`

✅ **Backend is live!**

---

## Step 3: Deploy Frontend to Vercel (15 minutes)

### 3.1 Update Frontend Environment

1. In your local project, update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.up.railway.app/api/v1
   ```
   (Replace with your actual Railway URL)

2. Commit the change:
   ```bash
   git add frontend/.env.local
   git commit -m "Update API URL for production"
   git push
   ```

### 3.2 Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Vercel will auto-detect Next.js

### 3.3 Configure Build Settings

1. **Root Directory**: Leave empty (or set to `frontend` if needed)
2. **Framework Preset**: Next.js (auto-detected)
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`

### 3.4 Add Environment Variables

1. In the deployment settings, add:
   ```
   NEXT_PUBLIC_API_URL = https://your-app.up.railway.app/api/v1
   ```
   (Replace with your actual Railway URL)

2. Click **"Deploy"**

### 3.5 Get Your Frontend URL

1. Wait for deployment to complete (2-3 minutes)
2. Vercel will show your URL: `https://your-app.vercel.app`
3. Click on the URL to open your app

✅ **Frontend is live!**

---

## Step 4: Update CORS Settings (5 minutes)

### 4.1 Update Backend CORS

1. Go back to Railway dashboard
2. Click on your backend service
3. Go to **"Variables"** tab
4. Update `CORS_ORIGINS` with your actual Vercel URL:
   ```
   CORS_ORIGINS = https://your-app.vercel.app,https://your-app-git-*.vercel.app,https://your-app-*.vercel.app
   ```

5. Click **"Redeploy"** (Railway will restart automatically)

### 4.2 Wait for Redeploy

1. Wait 1-2 minutes for Railway to redeploy
2. Check logs to ensure it started successfully

---

## Step 5: Test Everything End-to-End (10 minutes)

### 5.1 Test Frontend

1. Open your Vercel URL: `https://your-app.vercel.app`
2. You should see the Todo App interface

### 5.2 Test Creating a Task

1. Click **"+ New Task"**
2. Fill in:
   - Title: "Test Production Task"
   - Description: "Testing deployment"
   - Priority: High
   - Tags: "production, test"
3. Click **"Create Task"**
4. Task should appear in the list

### 5.3 Test All Features

- ✅ Create task
- ✅ Mark task as complete
- ✅ Edit task
- ✅ Delete task
- ✅ Search tasks
- ✅ Filter by status/priority
- ✅ Sort tasks

### 5.4 Test API Directly

1. Open: `https://your-app.up.railway.app/docs`
2. Try the **GET /api/v1/tasks** endpoint
3. You should see your test task

✅ **Everything is working!**

---

## 🎉 Deployment Complete!

### Your Live URLs:

1. **Frontend**: `https://your-app.vercel.app`
2. **Backend API**: `https://your-app.up.railway.app`
3. **API Documentation**: `https://your-app.up.railway.app/docs`
4. **Database**: Neon Postgres (managed)

---

## 📊 Monitoring & Maintenance

### Railway (Backend)

1. **View Logs**: Railway Dashboard → Your Service → Deployments → View Logs
2. **Metrics**: Railway Dashboard → Your Service → Metrics
3. **Restart**: Railway Dashboard → Your Service → Settings → Restart

### Vercel (Frontend)

1. **View Logs**: Vercel Dashboard → Your Project → Deployments → View Logs
2. **Analytics**: Vercel Dashboard → Your Project → Analytics
3. **Redeploy**: Vercel Dashboard → Your Project → Deployments → Redeploy

### Neon (Database)

1. **View Metrics**: Neon Dashboard → Your Project → Monitoring
2. **Backups**: Automatic daily backups (7-day retention)
3. **Connection Pooling**: Enabled by default

---

## 🔧 Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: CORS errors in browser console

**Solution**:
1. Check Railway `CORS_ORIGINS` includes your Vercel URL
2. Make sure Vercel `NEXT_PUBLIC_API_URL` is correct
3. Redeploy both services

### Backend Not Starting

**Problem**: Railway deployment fails

**Solution**:
1. Check Railway logs for errors
2. Verify `DATABASE_URL` is correct (must start with `postgresql+asyncpg://`)
3. Check `requirements.txt` has all dependencies
4. Verify Python version in `runtime.txt`

### Database Connection Errors

**Problem**: Backend can't connect to Neon

**Solution**:
1. Verify Neon database is active (not suspended)
2. Check connection string format: `postgresql+asyncpg://...`
3. Ensure Neon project is in the same region as Railway
4. Check Neon dashboard for connection limits

### Tasks Not Persisting

**Problem**: Tasks disappear after refresh

**Solution**:
1. Verify backend is using Neon (not SQLite)
2. Check Railway `DATABASE_URL` environment variable
3. Look for database errors in Railway logs

---

## 💰 Cost Breakdown

### Free Tier Limits:

**Neon Postgres**:
- ✅ 0.5 GB storage
- ✅ 1 project
- ✅ Unlimited queries
- ✅ 7-day backups

**Railway**:
- ✅ $5 free credit/month
- ✅ ~500 hours runtime
- ✅ Enough for hobby projects

**Vercel**:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Global CDN

**Total Monthly Cost**: $0 (within free tiers)

---

## 🚀 Next Steps

### Optional Enhancements:

1. **Custom Domain**:
   - Vercel: Settings → Domains → Add Domain
   - Railway: Settings → Domains → Add Custom Domain

2. **Environment Branches**:
   - Create `staging` branch for testing
   - Vercel auto-deploys preview branches

3. **Monitoring**:
   - Add Sentry for error tracking
   - Set up uptime monitoring (UptimeRobot)

4. **CI/CD**:
   - GitHub Actions for automated testing
   - Auto-deploy on push to main

---

## 📝 Deployment Checklist

- [ ] Neon database created
- [ ] Neon connection string copied
- [ ] Railway project created
- [ ] Backend environment variables set
- [ ] Backend deployed successfully
- [ ] Railway URL obtained
- [ ] Vercel project created
- [ ] Frontend environment variables set
- [ ] Frontend deployed successfully
- [ ] Vercel URL obtained
- [ ] CORS settings updated
- [ ] End-to-end testing completed
- [ ] All features working
- [ ] Documentation updated

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review Railway/Vercel logs
3. Verify all environment variables
4. Test backend API directly at `/docs`
5. Check browser console for errors

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: 2026-02-06
**Phase**: 2 (Full-Stack Web Application)
