#!/bin/bash

set -e

echo "🔧 Setting up and starting development environment..."

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if required tools are installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install it first."
    exit 1
fi

echo "✅ Prerequisites verified"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd web/web-app && npm install && cd ../..
cd functions && npm install && cd ..

# Start PostgreSQL in Docker
echo "🐳 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec corepadel-postgres-dev pg_isready -U corepadel -d corepadel; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run database migrations
echo "🗄️ Running database migrations..."
docker exec corepadel-postgres-dev psql -U corepadel -d corepadel -f /docker-entrypoint-initdb.d/006_update_user_table_for_firebase.sql || true

echo "✅ Development environment setup completed!"

# Start all services using concurrently
echo "🚀 Starting all development services..."
echo ""
echo "Starting:"
echo "   - Angular app on http://localhost:4201"
echo "   - Firebase emulators on http://localhost:9099 (auth) and http://localhost:5001 (functions)"
echo "   - Quarkus backend on http://localhost:8081"
echo "   - PostgreSQL on localhost:5432"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start all services concurrently
npm run dev
