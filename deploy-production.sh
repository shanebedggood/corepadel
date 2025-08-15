#!/bin/bash

set -e

echo "🚀 Starting production deployment..."

# Check if required tools are installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Please run 'firebase login' first."
    exit 1
fi

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not logged into Google Cloud. Please run 'gcloud auth login' first."
    exit 1
fi

echo "✅ Authentication verified"

# Build Angular app
echo "📦 Building Angular app..."
cd web/web-app
npm run build
cd ../..

# Build Firebase Functions
echo "📦 Building Firebase Functions..."
cd functions
npm run build
cd ..

# Deploy Firebase services (Auth, Functions, Hosting)
echo "🔥 Deploying Firebase services..."
firebase deploy --only auth,functions,hosting

# Build Quarkus app
echo "📦 Building Quarkus app..."
cd services
./mvnw clean package -Dquarkus.package.type=jar
cd ..

# Deploy Quarkus to Cloud Run
echo "🚀 Deploying Quarkus to Cloud Run..."
gcloud run deploy corepadel-quarkus \
  --source services/target/quarkus-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql:///corepadel?host=/cloudsql/corepadelapp:us-central1:corepadel-fdc&user=corepadel&password=corepadel123" \
  --set-env-vars="QUARKUS_HTTP_CORS_ORIGINS=https://corepadelapp.web.app" \
  --set-env-vars="FIREBASE_PROJECT_ID=corepadelapp"

echo "✅ Production deployment completed!"
echo ""
echo "🌐 Your app is now available at:"
echo "   Frontend: https://corepadelapp.web.app"
echo "   Backend: https://corepadel-quarkus-xxxxx-uc.a.run.app"
echo ""
echo "📊 Monitor your deployment:"
echo "   Firebase Console: https://console.firebase.google.com/project/corepadelapp"
echo "   Cloud Run Console: https://console.cloud.google.com/run"
