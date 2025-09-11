#!/bin/bash

# Local Backend Development Script
# This script starts the Quarkus backend in development mode for local testing

set -e

echo "🚀 Starting Core Padel Backend in Local Development Mode"
echo "========================================================"

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    echo "❌ Error: Please run this script from the services directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: services/"
    exit 1
fi

# Check if PostgreSQL is running locally
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  Warning: PostgreSQL is not running on localhost:5432"
    echo "   You can either:"
    echo "   1. Start Docker Compose PostgreSQL: docker-compose up -d postgres"
    echo "   2. Start local PostgreSQL: brew services start postgresql"
    echo "   3. Use Cloud SQL Proxy: ./cloud_sql_proxy -instances=corepadelapp:us-central1:corepadel-db=tcp:5432 &"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if database exists
if ! psql -h localhost -U corepadel -d corepadel -c "SELECT 1;" > /dev/null 2>&1; then
    echo "⚠️  Warning: Cannot connect to local database 'corepadel'"
    echo "   You may need to create it: createdb -U corepadel corepadel"
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
echo "   - Profile: dev"
echo "   - Port: 8081"
echo "   - Database: localhost:5432/corepadel"
echo "   - CORS: localhost:4200"
echo "   - Auth: Disabled (for local testing)"
echo ""

echo "🔧 Starting Quarkus in development mode..."
echo "   This will:"
echo "   - Watch for code changes and auto-reload"
echo "   - Create database schema automatically"
echo "   - Show detailed SQL logging"
echo "   - Enable Swagger UI at http://localhost:8081/swagger-ui"
echo ""

# Start Quarkus in dev mode
./mvnw quarkus:dev -Dquarkus.profile=dev
