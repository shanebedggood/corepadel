#!/bin/bash

# Development script for Padel Tournament Management System
# This script starts the Angular development server connected to production Firebase

set -e

echo "🚀 Starting Padel Tournament Management System Development Environment"
echo "================================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "❌ Error: Angular CLI not found. Please install it with: npm install -g @angular/cli"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🌐 Starting Angular development server..."
echo "   - Environment: Development (localhost)"
echo "   - Firebase: Production (padel-3b62e)"
echo "   - URL: http://localhost:4200"
echo "   - Press Ctrl+C to stop"
echo ""

# Start Angular development server with better state preservation
cd web-app
ng serve --open --configuration=development --hmr --poll=2000 