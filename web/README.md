# STRIDE & SERVE Web Application

A modern padel application built with Angular and PostgreSQL backend, featuring separate development and production environments.

## Prerequisites

- Node.js (>=18.0.0)
- npm (>=8.0.0)
- Firebase CLI
- PostgreSQL database

## Quick Start

```bash
# Run the setup script (installs dependencies and configures Firebase)
npm run setup

# Start development environment
npm run dev

# Build for production
npm run build:prod

# Deploy to production
npm run deploy:prod
```

## Project Structure

```
web/
├── web-app/                    # Angular application
│   ├── src/
│   │   ├── app/               # Application code
│   │   ├── assets/            # Static assets (including images)
│   │   └── environments/      # Environment configuration
│   ├── package.json           # Angular dependencies
│   └── angular.json           # Angular configuration
├── scripts/                   # Build and deployment scripts
│   ├── deploy.sh             # Deployment script
│   ├── dev.sh                # Development script
│   └── setup.sh              # Setup script
├── package.json               # Root dependencies
└── README.md                  # This file
```

## Available Commands

- `npm run dev` - Start Angular development server
- `npm run build` - Build Angular application
- `npm run deploy:all` - Deploy all services (web app, hosting)
- `npm run deploy:hosting` - Deploy only hosting
- `npm run setup` - Setup development environment

## Firebase Services

The application uses Firebase for:

- **Hosting**: Static file hosting for the Angular app

## Image Storage

Images are stored locally in the Angular assets directory:
- **Location**: `web-app/src/assets/images/`
- **Structure**: Organized by size (small, medium, large) and format (webp, jpg)
- **Benefits**: 
  - No external dependencies
  - Faster loading times
  - No storage costs
  - Simplified deployment

## Environment Configuration

The application uses the same Firebase environment for both development and production:
- `ng serve` (development) → Uses production Firebase project
- `ng build --configuration production` → Uses production Firebase project

## Security

- **Authentication**: Handled by Keycloak
- **Images**: Served directly from assets (no authentication required)

## Deployment

The application uses Firebase CLI for deployment, which provides:
- Automated builds and deployments
- Environment-specific configurations
- Rollback capabilities
- Performance monitoring

## Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [Angular Documentation](https://angular.io/docs)

## Development

### Getting Started

1. Clone the repository
2. Install dependencies: `npm run setup`
3. Start development server: `npm run dev`
4. Open http://localhost:4200

### Building for Production

```bash
# Build the application
npm run build:prod

# Deploy to production
npm run deploy:prod
```

### Adding Images

To add new images to the application:

1. Place images in the appropriate directory under `web-app/src/assets/images/`
2. Use the `LocalImageService` in your components to load images
3. Images are automatically served by the Angular development server and included in production builds

### Troubleshooting

1. **Firebase CLI not found**: Install with `npm install -g firebase-tools`
2. **Authentication issues**: Run `firebase login`
3. **Build errors**: Check Node.js version and dependencies
4. **Image not loading**: Verify the image path in `assets/images/` directory 