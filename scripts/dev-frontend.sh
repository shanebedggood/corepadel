#!/bin/bash

# Local Frontend Development Script
# This script starts the Angular frontend in development mode for local testing

set -e

echo "🌐 Starting Core Padel Frontend in Local Development Mode"
echo "========================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the web/web-app directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: web/web-app/"
    exit 1
fi

# Check if backend is running
if ! curl -s http://localhost:8081/health > /dev/null 2>&1; then
    echo "⚠️  Warning: Backend is not running on localhost:8081"
    echo "   Please start the backend first: ../scripts/dev-backend.sh"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Environment checks passed"
echo ""

echo "📋 Configuration:"
echo "   - Backend: http://localhost:8081/api"
echo "   - Frontend: http://localhost:4200"
echo "   - Environment: local"
echo "   - Auth: Disabled (for local testing)"
echo ""

echo "🔧 Starting Angular in development mode..."
echo "   This will:"
echo "   - Watch for code changes and auto-reload"
echo "   - Use local backend API"
echo "   - Enable hot reload"
echo ""

# Start Angular in dev mode
npm run start:local
