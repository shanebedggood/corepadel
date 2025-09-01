#!/bin/bash

# Production deployment script for STRIDE & SERVE
# This script builds and deploys the application to production

set -e  # Exit on any error

echo "🚀 Starting production deployment for STRIDE & SERVE..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Please run 'firebase login' first."
    exit 1
fi

echo "✅ Firebase CLI verified"

# Build Angular application
echo "📦 Building Angular application..."
cd web/web-app
npm run build:prod
cd ../..

# Deploy Firebase services (Auth, Hosting)
echo "🚀 Deploying to Firebase..."
firebase deploy --only auth,hosting

echo "✅ Production deployment completed successfully!"
echo ""
echo "🌐 Your application is now live at:"
echo "   https://corepadelapp.web.app"
echo ""
echo "📊 Firebase Console:"
echo "   https://console.firebase.google.com/project/corepadelapp"
