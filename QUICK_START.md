# ⚡ Quick Start - Deploy in 15 Minutes

**Last Updated**: 2026-02-07

This guide will get your Todo app deployed on Vercel and Hugging Face in ~15 minutes.

---

## 🎯 What You'll Deploy

- **Frontend**: Beautiful Next.js app on Vercel
- **Backend**: FastAPI on Hugging Face Spaces
- **Database**: Neon Postgres (free tier)

---

## 📋 Prerequisites (5 minutes)

1. **GitHub Account** - [Sign up](https://github.com/join)
2. **Vercel Account** - [Sign up](https://vercel.com/signup) (use GitHub)
3. **Hugging Face Account** - [Sign up](https://huggingface.co/join)
4. **Neon Account** - [Sign up](https://neon.tech)

---

## 🗄️ Step 1: Setup Database (3 minutes)

1. Go to [neon.tech](https://neon.tech) and sign in
2. Click "Create Project"
3. Name it "todo-app"
4. Click "Create Project"
5. **Copy the connection string** - it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```
6. **Save it** - you'll need it in Step 3

---

## 🚀 Step 2: Deploy Backend (5 minutes)

1. **Create Hugging Face Space**
   - Go to [huggingface.co/spaces](https://huggingface.co/spaces)
   - Click "Create new Space"
   - Name: `todo-api`
   - SDK: Select **Docker**
   - Visibility: Public
   - Click "Create Space"

2. **Upload Backend Files**

   Upload these files from your `backend` folder:
   - `Dockerfile`
   - `requirements.txt`
   - `app/` folder (all files inside)
   - Rename `README_HF.md` to `README.md` and upload

3. **Configure Secrets**
   - Click "Settings" tab
   - Scroll to "Repository secrets"
   - Add secret:
     - Name: `DATABASE_URL`
     - Value: Change your Neon connection string from:
       ```
       postgresql://user:password@host/database
       ```
       to:
       ```
       postgresql+asyncpg://user:password@host/database
       ```
       (Just add `+asyncpg` after `postgresql`)

   - Add another secret:
     - Name: `CORS_ORIGINS`
     - Value: `*` (we'll update this later)

4. **Wait for Build**
   - Space will build automatically (3-5 minutes)
   - Watch the "Logs" tab
   - When done, you'll see "Running on http://0.0.0.0:7860"

5. **Test Your API**
   - Your API URL is: `https://YOUR_USERNAME-todo-api.hf.space`
   - Visit: `https://YOUR_USERNAME-todo-api.hf.space/docs`
   - You should see the API documentation
   - **Copy this URL** - you'll need it for Step 3

---

## 🎨 Step 3: Deploy Frontend (5 minutes)

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - **Important**: Set "Root Directory" to `frontend`
   - Click "Edit" next to "Root Directory" and select `frontend`

3. **Add Environment Variable**
   - Before deploying, click "Environment Variables"
   - Add:
     - Name: `NEXT_PUBLIC_API_URL`
     - Value: `https://YOUR_USERNAME-todo-api.hf.space/api/v1`
     - (Replace YOUR_USERNAME with your Hugging Face username)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live!

5. **Update CORS**
   - Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
   - Go back to Hugging Face Space settings
   - Update `CORS_ORIGINS` secret to:
     ```
     https://your-app.vercel.app,https://your-app-*.vercel.app
     ```
   - Click "Restart Space" (top right)

---

## ✅ Step 4: Test Everything (2 minutes)

1. **Visit Your App**
   - Go to your Vercel URL
   - You should see the beautiful Todo app

2. **Create a Task**
   - Click "+ New Task"
   - Fill in the form
   - Click "Create Task"
   - Task should appear in the list

3. **Test Features**
   - ✅ Mark task as complete
   - ✅ Edit a task
   - ✅ Delete a task
   - ✅ Search tasks
   - ✅ Filter by priority
   - ✅ Sort tasks

4. **Check Mobile**
   - Open on your phone
   - Should be fully responsive

---

## 🎉 You're Done!

Your Todo app is now live on the internet!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://YOUR_USERNAME-todo-api.hf.space`
- **API Docs**: `https://YOUR_USERNAME-todo-api.hf.space/docs`

---

## 🐛 Quick Troubleshooting

### Frontend shows "Failed to fetch"

**Fix**: Update CORS_ORIGINS in Hugging Face Space settings
1. Go to HF Space → Settings → Repository secrets
2. Update `CORS_ORIGINS` with your Vercel URL
3. Restart the Space

### Backend shows "Database connection failed"

**Fix**: Check DATABASE_URL format
- Must be: `postgresql+asyncpg://...` (note the `+asyncpg`)
- Verify Neon database is active
- Check connection string is correct

### Vercel build fails

**Fix**: Check build logs
1. Go to Vercel dashboard → Deployments
2. Click failed deployment
3. Check logs for errors
4. Common fix: Ensure `frontend` is set as root directory

---

## 📚 Next Steps

- **Custom Domain**: Add your own domain in Vercel settings
- **Analytics**: Enable Vercel Analytics
- **Monitoring**: Check Hugging Face Space logs
- **Scaling**: Upgrade to Hugging Face Pro for better performance

---

## 🆘 Need Help?

- Check `DEPLOYMENT_COMPLETE.md` for detailed guide
- Review `TROUBLESHOOTING.md` for common issues
- Test locally first: See `README.md`

---

**Congratulations! 🎊 Your app is live!**

Share your deployment:
- Tweet your Vercel URL
- Show it to friends
- Add it to your portfolio

**Built with**: Next.js • FastAPI • Neon Postgres • Vercel • Hugging Face
