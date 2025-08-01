#!/bin/bash

# Padel App Setup Script
# This script sets up the development environment for the Padel project

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

# Function to check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed."
        echo "Please install it using: npm install -g firebase-tools"
        exit 1
    fi
    print_success "Firebase CLI is installed"
}

# Function to check if user is logged in
check_auth() {
    if ! firebase projects:list &> /dev/null; then
        print_error "You are not logged in to Firebase."
        echo "Please run: firebase login"
        exit 1
    fi
    print_success "Firebase authentication verified"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install web app dependencies
    cd web-app
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Main setup function
main() {
    print_status "Setting up Padel development environment..."
    
    # Check prerequisites
    check_firebase_cli
    check_auth
    
    # Install dependencies
    install_dependencies
    
    print_success "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run 'npm run dev' to start the development server"
    echo "2. Run 'npm run deploy:all' to deploy all services"
    echo "3. Check the README.md for more information"
}

# Run main function
main "$@" 