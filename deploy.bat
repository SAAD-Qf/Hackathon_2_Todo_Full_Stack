@echo off
REM Automated Deployment Script for Phase 2 (Windows)
REM This script will deploy your app to Vercel and Railway automatically

echo.
echo 🚀 Starting Automated Deployment...
echo.

REM Step 1: Check authentication
echo Step 1: Checking authentication...

REM Check Vercel authentication
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Not logged in to Vercel
    echo Please run: vercel login
    echo Then run this script again.
    exit /b 1
)

REM Check Railway authentication
railway whoami >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Not logged in to Railway
    echo Please run: railway login
    echo Then run this script again.
    exit /b 1
)

echo ✅ Authentication verified
echo.

REM Step 2: Deploy Backend to Railway
echo Step 2: Deploying Backend to Railway...
cd backend

REM Initialize Railway project if needed
if not exist "railway.toml" (
    echo Initializing Railway project...
    railway init
)

REM Deploy to Railway
echo Deploying backend...
railway up

REM Get Railway URL
for /f "tokens=*" %%i in ('railway domain') do set RAILWAY_URL=%%i
echo ✅ Backend deployed to: %RAILWAY_URL%
echo.

cd ..

REM Step 3: Deploy Frontend to Vercel
echo Step 3: Deploying Frontend to Vercel...
cd frontend

REM Deploy to Vercel with environment variable
echo Deploying frontend...
vercel --prod --yes -e NEXT_PUBLIC_API_URL=%RAILWAY_URL%/api/v1

REM Get Vercel URL
for /f "tokens=2" %%i in ('vercel inspect --prod ^| findstr "URL:"') do set VERCEL_URL=%%i
echo ✅ Frontend deployed to: %VERCEL_URL%
echo.

cd ..

REM Step 4: Update Railway CORS
echo Step 4: Updating CORS settings...
cd backend

railway variables set CORS_ORIGINS=%VERCEL_URL%,https://*.vercel.app

echo ✅ CORS updated
echo.

cd ..

REM Step 5: Summary
echo.
echo 🎉 Deployment Complete!
echo.
echo Your app is now live:
echo Frontend: %VERCEL_URL%
echo Backend: %RAILWAY_URL%
echo API Docs: %RAILWAY_URL%/docs
echo.
echo Next steps:
echo 1. Open %VERCEL_URL% in your browser
echo 2. Test creating a task
echo 3. Verify all features work
echo.
echo Save these URLs in DEPLOYMENT_URLS.md
