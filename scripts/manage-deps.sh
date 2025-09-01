#!/bin/bash

# Dependency management script for Core Padel
# This script helps manage dependencies across the different projects

set -e

echo "🧹 Core Padel Dependency Management"
echo "=================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
if ! command_exists npm; then
    echo "❌ npm is not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Prerequisites verified"

# Function to install dependencies for a specific project
install_deps() {
    local project_path="$1"
    local project_name="$2"
    
    echo "📦 Installing dependencies for $project_name..."
    cd "$project_path"
    
    if [ -f "package.json" ]; then
        npm ci --silent
        echo "✅ $project_name dependencies installed"
    else
        echo "⚠️  No package.json found in $project_path"
    fi
    
    cd - > /dev/null
}

# Function to clean node_modules for a specific project
clean_deps() {
    local project_path="$1"
    local project_name="$2"
    
    echo "🧹 Cleaning dependencies for $project_name..."
    cd "$project_path"
    
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        echo "✅ $project_name node_modules cleaned"
    else
        echo "ℹ️  No node_modules found in $project_path"
    fi
    
    cd - > /dev/null
}

# Function to show dependency sizes
show_sizes() {
    echo "📊 Dependency Sizes:"
    echo "==================="
    
    if [ -d "node_modules" ]; then
        echo "Root: $(du -sh node_modules 2>/dev/null | cut -f1)"
    fi
    
    if [ -d "web/node_modules" ]; then
        echo "Web: $(du -sh web/node_modules 2>/dev/null | cut -f1)"
    fi
    
    if [ -d "web/web-app/node_modules" ]; then
        echo "Angular App: $(du -sh web/web-app/node_modules 2>/dev/null | cut -f1)"
    fi
    
    # Scripts folder removed - was unnecessary
}

# Function to check for outdated packages
check_updates() {
    echo "🔍 Checking for outdated packages..."
    echo "=================================="
    
    echo "Root project:"
    cd .
    npm outdated --depth=0 2>/dev/null || echo "All packages up to date"
    cd - > /dev/null
    
    echo ""
    echo "Web project:"
    cd web
    npm outdated --depth=0 2>/dev/null || echo "All packages up to date"
    cd - > /dev/null
    
    echo ""
    echo "Angular app:"
    cd web/web-app
    npm outdated --depth=0 2>/dev/null || echo "All packages up to date"
    cd - > /dev/null
    
    # Scripts folder removed - was unnecessary
}

# Main script logic
case "${1:-help}" in
    "install"|"i")
        echo "Installing all dependencies..."
        install_deps . "Root"
        install_deps web "Web"
        install_deps web/web-app "Angular App"
        # Scripts folder removed - was unnecessary
        echo ""
        echo "✅ All dependencies installed!"
        ;;
    "clean"|"c")
        echo "Cleaning all dependencies..."
        clean_deps . "Root"
        clean_deps web "Web"
        clean_deps web/web-app "Angular App"
        # Scripts folder removed - was unnecessary
        echo ""
        echo "✅ All dependencies cleaned!"
        ;;
    "sizes"|"s")
        show_sizes
        ;;
    "update"|"u")
        check_updates
        ;;
    "install-root")
        install_deps . "Root"
        ;;
    "install-web")
        install_deps web "Web"
        ;;
    "install-app")
        install_deps web/web-app "Angular App"
        ;;
    # Scripts folder removed - was unnecessary
    "clean-root")
        clean_deps . "Root"
        ;;
    "clean-web")
        clean_deps web "Web"
        ;;
    "clean-app")
        clean_deps web/web-app "Angular App"
        ;;
    # Scripts folder removed - was unnecessary
    "help"|"h"|*)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  install, i          Install all dependencies"
        echo "  clean, c            Clean all node_modules"
        echo "  sizes, s            Show dependency sizes"
        echo "  update, u           Check for outdated packages"
        echo ""
        echo "Individual project commands:"
        echo "  install-root        Install root dependencies"
        echo "  install-web         Install web dependencies"
        echo "  install-app         Install Angular app dependencies"
        echo "  clean-root          Clean root node_modules"
        echo "  clean-web           Clean web node_modules"
        echo "  clean-app           Clean Angular app node_modules"
        echo ""
        echo "Examples:"
        echo "  $0 install          # Install all dependencies"
        echo "  $0 clean            # Clean all node_modules"
        echo "  $0 sizes            # Show sizes of all node_modules"
        ;;
esac
