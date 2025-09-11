#!/bin/bash

# Local Database Management Script
# This script manages the Docker Compose PostgreSQL instance for local development

set -e

echo "🗄️  Core Padel Local Database Management"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: core_padel/"
    exit 1
fi

# Function to check if PostgreSQL is running
check_postgres() {
    if docker-compose ps postgres | grep -q "Up"; then
        return 0
    else
        return 1
    fi
}

# Function to start PostgreSQL
start_postgres() {
    echo "🚀 Starting PostgreSQL container..."
    docker-compose up -d postgres
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    local attempts=0
    local max_attempts=30
    
    while [ $attempts -lt $max_attempts ]; do
        if check_postgres && pg_isready -h localhost -p 5432 -U corepadel -d corepadel > /dev/null 2>&1; then
            echo "✅ PostgreSQL is ready!"
            return 0
        fi
        
        echo "   Attempt $((attempts + 1))/$max_attempts - waiting..."
        sleep 2
        attempts=$((attempts + 1))
    done
    
    echo "❌ PostgreSQL failed to start within 60 seconds"
    echo "   Check logs: docker-compose logs postgres"
    return 1
}

# Function to stop PostgreSQL
stop_postgres() {
    echo "🛑 Stopping PostgreSQL container..."
    docker-compose stop postgres
    echo "✅ PostgreSQL stopped"
}

# Function to restart PostgreSQL
restart_postgres() {
    echo "🔄 Restarting PostgreSQL container..."
    docker-compose restart postgres
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    local attempts=0
    local max_attempts=15
    
    while [ $attempts -lt $max_attempts ]; do
        if check_postgres && pg_isready -h localhost -p 5432 -U corepadel -d corepadel > /dev/null 2>&1; then
            echo "✅ PostgreSQL is ready!"
            return 0
        fi
        
        echo "   Attempt $((attempts + 1))/$max_attempts - waiting..."
        sleep 2
        attempts=$((attempts + 1))
    done
    
    echo "❌ PostgreSQL failed to start within 30 seconds"
    return 1
}

# Function to show status
show_status() {
    echo "📊 PostgreSQL Status:"
    echo "===================="
    
    if check_postgres; then
        echo "✅ Container: Running"
        
        if pg_isready -h localhost -p 5432 -U corepadel -d corepadel > /dev/null 2>&1; then
            echo "✅ Connection: Ready"
            echo "✅ Port: 5432"
            echo "✅ Database: corepadel"
            echo "✅ User: corepadel"
            
            # Test a simple query
            if psql -h localhost -U corepadel -d corepadel -c "SELECT version();" > /dev/null 2>&1; then
                echo "✅ Query: Working"
            else
                echo "❌ Query: Failed"
            fi
        else
            echo "❌ Connection: Not ready"
        fi
    else
        echo "❌ Container: Not running"
    fi
    
    echo ""
    echo "Container Details:"
    docker-compose ps postgres
}

# Function to reset database
reset_database() {
    echo "⚠️  WARNING: This will delete all data in the local database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing PostgreSQL container and data..."
        docker-compose down -v postgres
        
        echo "🚀 Starting fresh PostgreSQL container..."
        start_postgres
        
        echo "✅ Database reset complete"
    else
        echo "❌ Database reset cancelled"
    fi
}

# Function to show logs
show_logs() {
    echo "📋 PostgreSQL Logs:"
    echo "==================="
    docker-compose logs postgres
}

# Function to connect to database
connect_database() {
    if check_postgres && pg_isready -h localhost -p 5432 -U corepadel -d corepadel > /dev/null 2>&1; then
        echo "🔌 Connecting to PostgreSQL..."
        psql -h localhost -U corepadel -d corepadel
    else
        echo "❌ Cannot connect: PostgreSQL is not ready"
        echo "   Start it first: $0 start"
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start PostgreSQL container"
    echo "  stop      Stop PostgreSQL container"
    echo "  restart   Restart PostgreSQL container"
    echo "  status    Show PostgreSQL status"
    echo "  reset     Reset database (delete all data)"
    echo "  logs      Show PostgreSQL logs"
    echo "  connect   Connect to database with psql"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start the database"
    echo "  $0 status     # Check if it's running"
    echo "  $0 connect    # Connect with psql"
}

# Main script logic
case "${1:-help}" in
    start)
        start_postgres
        ;;
    stop)
        stop_postgres
        ;;
    restart)
        restart_postgres
        ;;
    status)
        show_status
        ;;
    reset)
        reset_database
        ;;
    logs)
        show_logs
        ;;
    connect)
        connect_database
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
