#!/bin/bash
# Automated Deployment Script for Phase 2
# This script will deploy your app to Vercel and Railway automatically

set -e  # Exit on any error

echo "🚀 Starting Automated Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check authentication
echo -e "${BLUE}Step 1: Checking authentication...${NC}"

# Check Vercel authentication
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Please run: vercel login"
    echo "Then run this script again."
    exit 1
fi

# Check Railway authentication
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Please run: railway login"
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ Authentication verified${NC}"
echo ""

# Step 2: Deploy Backend to Railway
echo -e "${BLUE}Step 2: Deploying Backend to Railway...${NC}"
cd backend

# Initialize Railway project if needed
if [ ! -f "railway.toml" ]; then
    echo "Initializing Railway project..."
    railway init
fi

# Deploy to Railway
echo "Deploying backend..."
railway up

# Get Railway URL
RAILWAY_URL=$(railway domain)
echo -e "${GREEN}✅ Backend deployed to: ${RAILWAY_URL}${NC}"
echo ""

cd ..

# Step 3: Deploy Frontend to Vercel
echo -e "${BLUE}Step 3: Deploying Frontend to Vercel...${NC}"
cd frontend

# Set environment variable for Vercel
export NEXT_PUBLIC_API_URL="${RAILWAY_URL}/api/v1"

# Deploy to Vercel
echo "Deploying frontend..."
vercel --prod --yes

# Get Vercel URL
VERCEL_URL=$(vercel inspect --prod | grep "URL:" | awk '{print $2}')
echo -e "${GREEN}✅ Frontend deployed to: ${VERCEL_URL}${NC}"
echo ""

cd ..

# Step 4: Update Railway CORS
echo -e "${BLUE}Step 4: Updating CORS settings...${NC}"
cd backend

railway variables set CORS_ORIGINS="${VERCEL_URL},https://*.vercel.app"

echo -e "${GREEN}✅ CORS updated${NC}"
echo ""

cd ..

# Step 5: Summary
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Your app is now live:"
echo -e "${BLUE}Frontend:${NC} ${VERCEL_URL}"
echo -e "${BLUE}Backend:${NC} ${RAILWAY_URL}"
echo -e "${BLUE}API Docs:${NC} ${RAILWAY_URL}/docs"
echo ""
echo "Next steps:"
echo "1. Open ${VERCEL_URL} in your browser"
echo "2. Test creating a task"
echo "3. Verify all features work"
echo ""
echo "Save these URLs in DEPLOYMENT_URLS.md"
