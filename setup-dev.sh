#!/bin/bash

# Development setup script for STRIDE & SERVE
# This script sets up the development environment

set -e  # Exit on any error

echo "🚀 Setting up development environment for STRIDE & SERVE..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17+ first."
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Prerequisites verified"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install Angular app dependencies
echo "📦 Installing Angular app dependencies..."
cd web/web-app
npm install
cd ../..

# Install Quarkus dependencies
echo "📦 Installing Quarkus dependencies..."
cd services
./mvnw dependency:resolve
cd ..

# Start PostgreSQL database
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

echo "✅ Development environment setup completed!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "📊 Available services:"
echo "   - Angular app on http://localhost:4200"
echo "   - Quarkus backend on http://localhost:8081"
echo "   - PostgreSQL database on localhost:5432"
