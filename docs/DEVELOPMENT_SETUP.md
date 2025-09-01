# Development Setup Guide

This guide will help you set up the STRIDE & SERVE development environment.

## 🏗️ Architecture

### Development Environment:
```
Angular App (localhost:4201) → Firebase Auth (Emulator) → Firebase Functions (Emulator) → Quarkus (localhost:8081) → PostgreSQL (Docker)
```

### Production Environment:
```
Angular App (Firebase Hosting) → Firebase Auth → Firebase Functions → Cloud SQL → Cloud Run (Quarkus)
```

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Java** (v17 or higher)
3. **Docker** (for PostgreSQL)
4. **Firebase CLI** (`npm install -g firebase-tools`)
5. **Google Cloud CLI** (for production deployment)

## 🚀 Quick Start

### One-Command Setup and Start
```bash
# Clone the repository
git clone <repository-url>
cd core_padel

# Setup and start all development services
./setup-dev.sh
```

This will:
1. Install all dependencies
2. Start PostgreSQL in Docker
3. Run database migrations
4. Start all services:
   - **Angular app** on http://localhost:4201
   - **Firebase Auth emulator** on http://localhost:9099
   - **Firebase Functions emulator** on http://localhost:5001
   - **Quarkus backend** on http://localhost:8081
   - **PostgreSQL** on localhost:5432

## 🔧 Individual Services

### Start Services Individually:

```bash
# PostgreSQL (Docker)
npm run dev:postgres

# Angular app
npm run dev:angular

# Firebase emulators
npm run dev:firebase

# Quarkus backend
npm run dev:quarkus

# All services together
npm run dev
```

## 🗄️ Database

### Development Database:
- **Host**: localhost:5432
- **Database**: corepadel
- **Username**: corepadel
- **Password**: corepadel123

### Connect to Database:
```bash
# Using psql
psql -h localhost -U corepadel -d corepadel

# Using Docker
docker exec -it corepadel-postgres-dev psql -U corepadel -d corepadel
```

## 🔥 Firebase Emulators

### Access Emulator UI:
- **Firebase Emulator UI**: http://localhost:4000
- **Auth Emulator**: http://localhost:9099
- **Functions Emulator**: http://localhost:5001

### Emulator Configuration:
- Emulators are automatically connected in development
- Production Firebase is used when not on localhost
- Test users can be created in the Auth emulator UI

## 🧪 Testing

### Run Tests:
```bash
# Angular tests
cd web/web-app && npm test

# Quarkus tests
npm run quarkus:test
```

### Test Firebase Functions:
```bash
# Test user sync
curl -X POST http://localhost:5001/corepadelapp/us-central1/syncUserToDatabase \
  -H "Content-Type: application/json" \
  -d '{"data": {"firebase_uid": "test123", "email": "test@example.com"}}'
```

## 🚀 Production Deployment

### Deploy to Production:
```bash
./deploy-production.sh
```

This will:
1. Build Angular app
2. Build Firebase Functions
3. Deploy Firebase services (Auth, Functions, Hosting)
4. Build Quarkus app
5. Deploy Quarkus to Cloud Run

### Production URLs:
- **Frontend**: https://corepadelapp.web.app
- **Backend**: https://corepadel-quarkus-xxxxx-uc.a.run.app

## 🔍 Troubleshooting

### Common Issues:

1. **Port conflicts**: Make sure ports 4201, 8081, 5432, 9099, 5001 are available
2. **Docker not running**: Start Docker Desktop
3. **Firebase not logged in**: Run `firebase login`
4. **Database connection issues**: Check if PostgreSQL container is running

### Reset Development Environment:
```bash
# Stop all services
docker-compose down
pkill -f "npm run dev"
pkill -f "quarkus:dev"

# Restart
./setup-dev.sh
```

## 📁 Project Structure

```
core_padel/
├── web/web-app/          # Angular frontend
├── services/             # Quarkus backend
├── functions/            # Firebase Functions
├── database/             # Database migrations
├── docker-compose.yml    # Development PostgreSQL
├── firebase.json         # Firebase configuration
├── setup-dev.sh          # Development setup and start script
└── deploy-production.sh  # Production deployment script
```

## 🤝 Contributing

1. Follow the existing code style
2. Test your changes locally
3. Update documentation if needed
4. Submit a pull request

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review the logs for each service
3. Create an issue with detailed error information
