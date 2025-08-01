#!/bin/bash

# Padel App Deployment Script
# This script handles deployment of the Padel application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to deploy web app
deploy_web_app() {
    print_status "Building web app..."
    cd web-app
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing web app dependencies..."
        npm install
    fi
    
    # Build the application
    print_status "Building Angular application..."
    npm run build:prod
    
    print_success "Web app built successfully"
    cd ..
}

# Function to deploy hosting
deploy_hosting() {
    print_status "Deploying hosting..."
    
    if [ ! -d "web-app/dist" ]; then
        print_error "Web app not built. Run 'npm run build' first."
        exit 1
    fi
    
    firebase deploy --only hosting
    print_success "Hosting deployed"
}

# Function to deploy all
deploy_all() {
    print_status "Deploying all services..."
    deploy_web_app
    deploy_hosting
    print_success "All services deployed"
}

# Function to deploy to development environment
deploy_dev() {
    print_status "Deploying to development environment..."
    firebase use dev
    deploy_all
    print_success "Development deployment complete"
}

# Function to deploy to production environment
deploy_prod() {
    print_status "Deploying to production environment..."
    firebase use prod
    deploy_all
    print_success "Production deployment complete"
}

# Main script logic
case "${1:-}" in
    --web-app)
        deploy_web_app
        ;;
    --hosting)
        deploy_hosting
        ;;
    --all)
        deploy_all
        ;;
    --dev)
        deploy_dev
        ;;
    --prod)
        deploy_prod
        ;;
    --help|help|"")
        echo "Padel App Deployment Script"
        echo ""
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  --web-app    Build the Angular web application"
        echo "  --hosting    Deploy hosting to Firebase"
        echo "  --all        Deploy all services (web app, hosting)"
        echo "  --dev        Deploy to development environment"
        echo "  --prod       Deploy to production environment"
        echo "  --help       Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 --web-app     # Build web app only"
        echo "  $0 --all         # Deploy all services"
        echo "  $0 --dev         # Deploy to development"
        echo "  $0 --prod        # Deploy to production"
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use '$0 --help' for usage information"
        exit 1
        ;;
esac 