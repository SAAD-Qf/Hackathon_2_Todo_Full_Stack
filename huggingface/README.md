# Todo API - Hugging Face Space

This is a FastAPI backend for the Todo Full-Stack application, deployed as a Hugging Face Space.

## 🚀 Quick Deploy to Hugging Face

### Option 1: Using Hugging Face Web Interface

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Choose:
   - **Space name**: `todo-api` (or your preferred name)
   - **License**: MIT
   - **Space SDK**: Docker
   - **Visibility**: Public or Private
4. Click "Create Space"
5. Upload these files:
   - `Dockerfile` (from backend directory)
   - `requirements.txt` (from backend directory)
   - All files from `backend/app/` directory
   - `README.md` (this file)
6. Configure Secrets in Space Settings:
   - `DATABASE_URL`: Your Neon Postgres connection string
   - `CORS_ORIGINS`: Your frontend URL (e.g., `https://your-app.vercel.app`)

### Option 2: Using Git

1. Create a new Space on Hugging Face
2. Clone the Space repository:
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/todo-api
   cd todo-api
   ```
3. Copy backend files:
   ```bash
   cp -r ../backend/* .
   ```
4. Commit and push:
   ```bash
   git add .
   git commit -m "Initial commit: Todo API"
   git push
   ```
5. Configure secrets in Space Settings

### Option 3: Using Hugging Face CLI

1. Install Hugging Face CLI:
   ```bash
   pip install huggingface_hub
   huggingface-cli login
   ```
2. Create and push Space:
   ```bash
   cd backend
   huggingface-cli repo create todo-api --type space --space_sdk docker
   git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/todo-api
   git push hf main
   ```

## 📋 Required Files

Ensure these files are in your Space:

```
todo-api/
├── Dockerfile              # Docker configuration
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI application
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── database.py        # Database connection
│   ├── crud.py            # CRUD operations
│   └── routers/
│       ├── __init__.py
│       └── tasks.py       # Task endpoints
└── .env.example           # Environment template
```

## 🔧 Configuration

### Environment Variables (Secrets)

Configure these in Space Settings → Repository secrets:

1. **DATABASE_URL** (Required)
   ```
   postgresql+asyncpg://user:password@host/database
   ```
   Get this from your Neon Postgres dashboard.

2. **CORS_ORIGINS** (Required)
   ```
   https://your-frontend.vercel.app,https://your-frontend-*.vercel.app
   ```
   Add your frontend URL(s) for CORS.

3. **ENVIRONMENT** (Optional)
   ```
   production
   ```

4. **LOG_LEVEL** (Optional)
   ```
   info
   ```

### Dockerfile

The Dockerfile is configured to:
- Use Python 3.11 slim image
- Install dependencies from requirements.txt
- Expose port 7860 (Hugging Face default)
- Run FastAPI with Uvicorn

## 🌐 API Endpoints

Once deployed, your API will be available at:
```
https://YOUR_USERNAME-todo-api.hf.space
```

### Available Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - List tasks (with filters)
- `GET /api/v1/tasks/{id}` - Get task by ID
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task
- `PATCH /api/v1/tasks/{id}/complete` - Toggle completion

## 🧪 Testing Your Deployment

### 1. Check Health
```bash
curl https://YOUR_USERNAME-todo-api.hf.space/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "2.0.0"
}
```

### 2. View API Documentation
Visit: `https://YOUR_USERNAME-todo-api.hf.space/docs`

### 3. Create a Test Task
```bash
curl -X POST https://YOUR_USERNAME-todo-api.hf.space/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing Hugging Face deployment",
    "priority": "high"
  }'
```

### 4. List Tasks
```bash
curl https://YOUR_USERNAME-todo-api.hf.space/api/v1/tasks
```

## 🔗 Connect Frontend

Update your frontend's `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-todo-api.hf.space/api/v1
```

Then redeploy your frontend on Vercel.

## 📊 Monitoring

### View Logs

In your Space:
1. Go to "Logs" tab
2. View real-time application logs
3. Check for errors or issues

### Check Status

The Space shows:
- Build status
- Runtime status
- Resource usage

## 🐛 Troubleshooting

### Space fails to build

**Check Dockerfile syntax:**
```bash
docker build -t test-build .
```

**Verify requirements.txt:**
Ensure all dependencies are listed with compatible versions.

### Database connection fails

**Verify DATABASE_URL secret:**
- Check it's set in Space Settings
- Ensure format: `postgresql+asyncpg://...`
- Test connection from local machine

**Check Neon database:**
- Ensure database is active
- Verify connection string is correct
- Check IP allowlist (Neon allows all by default)

### CORS errors

**Update CORS_ORIGINS secret:**
Include your frontend URL:
```
https://your-app.vercel.app,https://your-app-*.vercel.app
```

**Restart Space:**
After updating secrets, restart the Space for changes to take effect.

### API returns 500 errors

**Check logs:**
View Space logs for Python tracebacks.

**Common issues:**
- Missing environment variables
- Database connection timeout
- Invalid SQL queries

## 🔒 Security

### Best Practices

1. **Never commit secrets** to the repository
2. **Use Space secrets** for sensitive data
3. **Enable authentication** (Phase III feature)
4. **Validate all inputs** (already implemented with Pydantic)
5. **Keep dependencies updated**

### Rate Limiting

Hugging Face Spaces have rate limits:
- Free tier: Limited requests per minute
- Pro tier: Higher limits

Consider implementing rate limiting in your API for production use.

## 📈 Scaling

### Free Tier Limitations

- CPU-only compute
- Automatic sleep after inactivity
- Limited concurrent requests

### Upgrade Options

For production:
1. **Upgrade to Pro Space** for:
   - Persistent compute
   - More resources
   - No sleep mode

2. **Use dedicated hosting** (Railway, Render, etc.) for:
   - Better performance
   - More control
   - Custom domains

## 🔄 Updates

To update your deployed Space:

### Via Git
```bash
git pull origin main  # Get latest changes
git push hf main      # Push to Hugging Face
```

### Via Web Interface
Upload updated files through the Hugging Face web interface.

## 📚 Resources

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Neon Postgres Documentation](https://neon.tech/docs)
- [Project Repository](https://github.com/YOUR_USERNAME/todo-fullstack)

## 💡 Tips

1. **Use SQLite for testing**: Set `DATABASE_URL=sqlite+aiosqlite:///./todo.db` for quick testing
2. **Monitor logs**: Check logs regularly for errors
3. **Test locally first**: Always test Docker build locally before deploying
4. **Use .env.example**: Provide template for required environment variables
5. **Document API**: Keep README updated with API changes

## 🆘 Support

If you encounter issues:

1. Check Space logs
2. Review Hugging Face Spaces documentation
3. Test API endpoints with `/docs`
4. Verify database connection
5. Check CORS configuration

---

**Version**: 2.0.0
**Last Updated**: 2026-02-07
**License**: MIT
