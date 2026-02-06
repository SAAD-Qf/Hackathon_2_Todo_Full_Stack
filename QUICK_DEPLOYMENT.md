# Quick Deployment Commands

## Prerequisites
- Vercel CLI installed: `npm install -g vercel`
- Hugging Face account: https://huggingface.co/join
- Git installed

---

## 1. Deploy Backend to Hugging Face

```bash
# Navigate to backend
cd backend

# Create README for Hugging Face
cp README_HF.md README.md

# Add Hugging Face remote (replace YOUR_USERNAME)
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/todo-app-backend

# Commit and push
git add .
git commit -m "Deploy to Hugging Face"
git push hf main
```

**Your backend URL**: `https://YOUR_USERNAME-todo-app-backend.hf.space`

---

## 2. Deploy Frontend to Vercel

```bash
# Navigate to frontend
cd ../frontend

# Create production environment file (replace with your HF URL)
echo "NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-todo-app-backend.hf.space/api/v1" > .env.production

# Deploy to Vercel
vercel --prod --yes
```

**Your frontend URL**: Will be shown after deployment

---

## 3. Update CORS

Go to Hugging Face Space → Settings → Variables:
- Add `CORS_ORIGINS`: `https://your-vercel-url.vercel.app,https://*.vercel.app`

---

## Done! 🎉

Test your app at your Vercel URL.
