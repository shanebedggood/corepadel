# Project Structure - Core Padel

This document explains the project structure and dependency management for the Core Padel application.

## 📁 Project Structure

```
core_padel/
├── 📦 Root Project (Firebase & GCP setup)
│   ├── package.json          # Firebase CLI, deployment scripts
│   ├── node_modules/         # ~43MB
│   ├── setup-gcp.sh          # GCP resource setup
│   ├── deploy-production.sh  # Production deployment
│   └── cloudbuild.yaml       # Cloud Build configuration
│
├── 🌐 Web Project (Frontend)
│   ├── package.json          # Web project scripts, Firebase
│   ├── node_modules/         # ~223MB
│   └── web-app/              # Angular Application
│       ├── package.json      # Angular app dependencies
│       ├── node_modules/     # ~819MB
│       └── src/              # Angular source code
│
├── ⚡ Services (Backend)
│   ├── pom.xml               # Maven configuration
│   ├── src/                  # Quarkus source code
│   └── target/               # Build output (ignored)
│
├── 🗄️ Database
│   ├── corepadel.ddl         # Database schema
│   └── dml/                  # Data migration scripts
│
├── 📚 Documentation
│   ├── DEPLOYMENT_GUIDE.md   # Deployment instructions
│   └── PROJECT_STRUCTURE.md  # This file
│
└── 🔧 Configuration
    ├── .gitignore            # Git ignore rules
    ├── firebase.json         # Firebase configuration
    ├── docker-compose.yml    # Local development
    └── .github/workflows/    # GitHub Actions
```

## 📦 Why Multiple `node_modules` Folders?

Each `node_modules` folder serves a specific purpose and **all are required**:

### 1. **Root `node_modules`** (~43MB)
- **Purpose**: Firebase CLI, deployment scripts
- **Dependencies**: Firebase SDK, deployment tools
- **Why needed**: Manages GCP/Firebase deployment

### 2. **Web `node_modules`** (~223MB)
- **Purpose**: Web project management, Firebase integration
- **Dependencies**: Firebase SDK, web utilities
- **Why needed**: Handles web project scripts and Firebase integration

### 3. **Angular App `node_modules`** (~819MB)
- **Purpose**: Angular application dependencies
- **Dependencies**: Angular, PrimeNG, TailwindCSS, etc.
- **Why needed**: Frontend application framework and UI components

# Scripts folder removed - was unnecessary (138MB saved)

## 🧹 Dependency Management

### Using the Management Script

We provide a script to help manage dependencies across all projects:

```bash
# Show current dependency sizes
./scripts/manage-deps.sh sizes

# Install all dependencies
./scripts/manage-deps.sh install

# Clean all node_modules
./scripts/manage-deps.sh clean

# Check for outdated packages
./scripts/manage-deps.sh update
```

### Individual Project Management

```bash
# Install specific project dependencies
./scripts/manage-deps.sh install-root      # Root project
./scripts/manage-deps.sh install-web       # Web project
./scripts/manage-deps.sh install-app       # Angular app
./scripts/manage-deps.sh install-scripts   # Scripts

# Clean specific project dependencies
./scripts/manage-deps.sh clean-root        # Root project
./scripts/manage-deps.sh clean-web         # Web project
./scripts/manage-deps.sh clean-app         # Angular app
./scripts/manage-deps.sh clean-scripts     # Scripts
```

## 🔒 Git Ignore Strategy

The `.gitignore` file is configured to:

### ✅ **Exclude** (not tracked):
- All `node_modules/` folders
- Build outputs (`dist/`, `target/`)
- Environment files (`.env*`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)
- Logs and cache files
- Service account keys

### ✅ **Include** (tracked):
- `package.json` files (dependency definitions)
- `package-lock.json` files (exact versions)
- Source code
- Configuration files
- Documentation

## 🚀 Development Workflow

### Initial Setup
```bash
# Install all dependencies
./scripts/manage-deps.sh install

# Start development
npm run dev
```

### Adding New Dependencies
```bash
# Root project
npm install <package>

# Web project
cd web && npm install <package>

# Angular app
cd web/web-app && npm install <package>

# Scripts
cd web/scripts && npm install <package>
```

### Deployment
```bash
# Deploy to production
./deploy-production.sh

# Or use GitHub Actions (automatic on push to main)
git push origin main
```

## 💡 Best Practices

### 1. **Keep Dependencies Updated**
```bash
# Check for updates regularly
./scripts/manage-deps.sh update
```

### 2. **Clean Before Installing**
```bash
# If you encounter issues
./scripts/manage-deps.sh clean
./scripts/manage-deps.sh install
```

### 3. **Monitor Sizes**
```bash
# Check dependency sizes
./scripts/manage-deps.sh sizes
```

### 4. **Use Lock Files**
- Always commit `package-lock.json` files
- Never commit `node_modules` folders
- Use `npm ci` for consistent installs

## 🔍 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   # Reinstall dependencies
   ./scripts/manage-deps.sh clean
   ./scripts/manage-deps.sh install
   ```

2. **Version conflicts**
   ```bash
   # Check for outdated packages
   ./scripts/manage-deps.sh update
   ```

3. **Large repository size**
   ```bash
   # Check dependency sizes
   ./scripts/manage-deps.sh sizes
   ```

### Performance Tips

1. **Use npm ci** instead of `npm install` for faster, consistent installs
2. **Clean node_modules** before reinstalling if you encounter issues
3. **Monitor dependency sizes** regularly to avoid bloat
4. **Update dependencies** periodically to get security patches

## 📊 Size Breakdown

| Project | Size | Purpose |
|---------|------|---------|
| Root | ~43MB | Firebase CLI, deployment |
| Web | ~223MB | Web project management |
| Angular App | ~819MB | Frontend framework & UI |
| **Total** | **~1.1GB** | **Complete application** |

The total size is reasonable for a full-stack application with Angular, Firebase, and testing infrastructure.
