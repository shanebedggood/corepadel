# 🏠 Local Development Guide

This guide explains how to run Core Padel locally for development without affecting production.

## 🎯 **What Runs Locally vs Production**

| Component | Local | Production | Notes |
|-----------|-------|------------|-------|
| **Backend (Quarkus)** | ✅ Localhost:8081 | ✅ Cloud Run | Local uses dev profile |
| **Frontend (Angular)** | ✅ Localhost:4200 | ✅ Firebase Hosting | Local points to local backend |
| **Database** | ⚠️ Local PostgreSQL or Cloud SQL Proxy | ✅ Cloud SQL | Local can use either |
| **Authentication** | ❌ Disabled | ✅ Firebase Auth | Local bypasses auth for testing |
| **Storage** | ❌ Disabled | ✅ Firebase Storage | Local doesn't handle file uploads |

## 🚀 **Quick Start**

### 1. **Start Local Backend**
```bash
cd services
../scripts/dev-backend.sh
```

### 2. **Start Local Frontend** (in new terminal)
```bash
cd web/web-app
../scripts/dev-frontend.sh
```

### 3. **Access Your App**
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8081/api
- **Swagger UI**: http://localhost:8081/swagger-ui

## 🗄️ **Database Setup Options**

### Option A: Cloud SQL Proxy (Recommended)
```bash
# Install Cloud SQL Proxy
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64
chmod +x cloud_sql_proxy

# Start proxy to production database
./cloud_sql_proxy -instances=corepadelapp:us-central1:corepadel-db=tcp:5432 &

# Test connection
psql -h localhost -U corepadel -d corepadel -c "SELECT 1;"
```

### Option B: Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql
brew services start postgresql

# Create local database
createdb corepadel_local

# Update application-dev.properties to use corepadel_local
```

## ⚙️ **Configuration Files**

### Backend: `services/src/main/resources/application-dev.properties`
- **Port**: 8081
- **Database**: localhost:5432/corepadel
- **Auth**: Disabled (for local testing)
- **CORS**: localhost:4200
- **Logging**: DEBUG level with SQL queries

### Frontend: `web/web-app/src/environments/environment.local.ts`
- **API URL**: http://localhost:8081/api
- **Environment**: local
- **Production**: false

## 🔧 **Development Scripts**

### Backend Script: `scripts/dev-backend.sh`
- Checks PostgreSQL connection
- Validates environment
- Starts Quarkus in dev mode
- Auto-reloads on code changes

### Frontend Script: `scripts/dev-frontend.sh`
- Checks backend availability
- Starts Angular in local mode
- Uses local backend API
- Hot reload enabled

## 📝 **Local Development Workflow**

1. **Make code changes** in your IDE
2. **Backend auto-reloads** (Quarkus dev mode)
3. **Frontend auto-reloads** (Angular dev mode)
4. **Test changes** immediately
5. **Commit and push** when ready

## 🧪 **Testing Locally**

### Test Backend API
```bash
# Health check
curl http://localhost:8081/health

# Test user creation (no auth required locally)
curl -X POST http://localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{"firebaseUid":"test123","email":"test@example.com","username":"testuser"}'
```

### Test Frontend
- Open http://localhost:4200
- Navigate through the app
- Check browser console for errors
- Verify API calls go to localhost:8081

## 🚨 **Important Notes**

### Authentication Bypass
- **Local backend** has auth disabled for easier testing
- **Production backend** requires valid Firebase tokens
- **Never commit** auth-disabled code to production

### Database Safety
- **Cloud SQL Proxy**: Safe, connects to production DB
- **Local PostgreSQL**: Safe, completely isolated
- **Schema changes**: Use `drop-and-create` locally, `none` in production

### Environment Variables
- **Local**: Uses `application-dev.properties`
- **Production**: Uses `application.properties` + Cloud Run env vars
- **Never hardcode** production values locally

## 🔍 **Troubleshooting**

### Backend Won't Start
```bash
# Check PostgreSQL
pg_isready -h localhost -p 5432

# Check database exists
psql -h localhost -U corepadel -d corepadel -c "SELECT 1;"

# Check port availability
lsof -i :8081
```

### Frontend Won't Start
```bash
# Check backend is running
curl http://localhost:8081/health

# Check port availability
lsof -i :4200

# Clear Angular cache
rm -rf node_modules/.cache
```

### Database Connection Issues
```bash
# Test Cloud SQL Proxy
psql -h localhost -U corepadel -d corepadel -c "SELECT 1;"

# Check proxy logs
tail -f cloud_sql_proxy.log

# Restart proxy if needed
pkill cloud_sql_proxy
./cloud_sql_proxy -instances=corepadelapp:us-central1:corepadel-db=tcp:5432 &
```

## 📚 **Useful Commands**

```bash
# Start everything locally
./scripts/dev-backend.sh &    # Backend in background
./scripts/dev-frontend.sh     # Frontend in foreground

# Check running services
lsof -i :8081  # Backend
lsof -i :4200  # Frontend
lsof -i :5432  # Database

# View logs
tail -f services/target/quarkus.log  # Backend logs
# Frontend logs in browser console
```

## 🎉 **You're Ready!**

Your local development environment is now set up to:
- ✅ Run backend locally with hot reload
- ✅ Run frontend locally with hot reload  
- ✅ Connect to local or production database
- ✅ Bypass authentication for easier testing
- ✅ Keep production completely isolated

Happy coding! 🚀
