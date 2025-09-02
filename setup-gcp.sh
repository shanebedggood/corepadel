#!/bin/bash

# GCP Setup script for Core Padel application
# This script sets up all required GCP resources for production deployment

set -e  # Exit on any error

PROJECT_ID="corepadelapp"
REGION="us-central1"
SERVICE_NAME="corepadel-quarkus"
DB_NAME="corepadel"
DB_USER="corepadel"
DB_PASSWORD="$(openssl rand -base64 32)"  # Generate a secure password

echo "🚀 Setting up GCP resources for Core Padel..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with Google Cloud. Please run 'gcloud auth login' first."
    exit 1
fi

echo "✅ Google Cloud CLI verified"

# Check if project exists and user has access
echo "📋 Checking project access..."
if ! gcloud projects describe $PROJECT_ID &> /dev/null; then
    echo "❌ Project $PROJECT_ID does not exist or you don't have access to it."
    echo "   Please create the project first or check your permissions."
    exit 1
fi

# Set the project
echo "📋 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Check if user has necessary permissions
echo "🔐 Checking permissions..."
if ! gcloud projects get-iam-policy $PROJECT_ID --flatten="bindings[].members" --format="table(bindings.role)" --filter="bindings.members:$(gcloud config get-value account)" | grep -E "(roles/owner|roles/editor)" &> /dev/null; then
    echo "⚠️  Warning: You may not have sufficient permissions to set up all resources."
    echo "   You need at least Editor role on the project."
    echo "   Current account: $(gcloud config get-value account)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    containerregistry.googleapis.com \
    artifactregistry.googleapis.com \
    firebase.googleapis.com \
    firebasehosting.googleapis.com \
    firebasestorage.googleapis.com

# Note: Firebase Auth API is enabled automatically when Firebase is set up
echo "ℹ️  Firebase Auth API will be enabled automatically when Firebase is configured"
echo "ℹ️  Artifact Registry API enabled for Docker image storage"

# Create Cloud SQL instance
echo "🗄️ Creating Cloud SQL PostgreSQL instance..."
if gcloud sql instances describe corepadel-db &> /dev/null; then
    echo "ℹ️  Cloud SQL instance 'corepadel-db' already exists, skipping creation..."
else
    gcloud sql instances create corepadel-db \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-type=SSD \
        --storage-size=10GB \
        --backup-start-time="02:00" \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=03 \
        --availability-type=zonal \
        --root-password="$DB_PASSWORD" \
        --quiet
fi

# Create database
echo "📊 Creating database..."
if gcloud sql databases list --instance=corepadel-db --filter="name:$DB_NAME" &> /dev/null; then
    echo "ℹ️  Database '$DB_NAME' already exists, skipping creation..."
else
    gcloud sql databases create $DB_NAME --instance=corepadel-db
fi

# Create database user
echo "👤 Creating database user..."
if gcloud sql users list --instance=corepadel-db --filter="name:$DB_USER" &> /dev/null; then
    echo "ℹ️  Database user '$DB_USER' already exists, updating password..."
    gcloud sql users set-password $DB_USER \
        --instance=corepadel-db \
        --password="$DB_PASSWORD"
else
    gcloud sql users create $DB_USER \
        --instance=corepadel-db \
        --password="$DB_PASSWORD"
fi

# Get the database connection info
DB_HOST=$(gcloud sql instances describe corepadel-db --format="value(connectionName)")
DB_URL="jdbc:postgresql:///$DB_NAME?cloudSqlInstance=$PROJECT_ID:$REGION:corepadel-db&socketFactory=com.google.cloud.sql.postgres.SocketFactory"

echo "🔗 Database connection info:"
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo "   JDBC URL: $DB_URL"

# Create service account for Cloud Build
echo "🔑 Creating service account for Cloud Build..."
if gcloud iam service-accounts describe cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com &> /dev/null; then
    echo "ℹ️  Service account 'cloudbuild-deployer' already exists, skipping creation..."
else
    gcloud iam service-accounts create cloudbuild-deployer \
        --display-name="Cloud Build Deployer" \
        --description="Service account for Cloud Build to deploy to Cloud Run"
fi

# Grant necessary permissions
echo "🔐 Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Grant Artifact Registry permissions for Docker image storage
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

# Grant Cloud Build Service Account role for running builds
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.builder"

# Grant Firebase Hosting admin to CI service account for Hosting deploys
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/firebasehosting.admin"

# Allow CI service account to read Cloud Run and Cloud Functions metadata used by Hosting rewrites
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.viewer"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudfunctions.viewer"

# Grant Cloud Build service account access to Cloud Run (will be created on first Cloud Build run)
echo "ℹ️  Cloud Build service account will be created automatically on first build"
echo "ℹ️  IAM permissions will be granted when Cloud Build is first used"

# Grant Cloud SQL Client to the Cloud Run runtime service account (Compute Default SA)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
RUNTIME_SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
echo "🔐 Granting Cloud SQL Client to runtime service account: $RUNTIME_SA"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$RUNTIME_SA" \
    --role="roles/cloudsql.client"

# Grant Firebase service agent permissions for Hosting deploy validations
FIREBASE_SA="service-$PROJECT_NUMBER@gcp-sa-firebase.iam.gserviceaccount.com"
echo "🔐 Granting Firebase service agent viewer roles: $FIREBASE_SA"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$FIREBASE_SA" \
    --role="roles/run.viewer"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$FIREBASE_SA" \
    --role="roles/cloudfunctions.viewer"

# Grant Firebase Admin SDK service account Hosting and viewer roles (used by Hosting action)
FIREBASE_ADM_SA="firebase-adminsdk-fbsvc@$PROJECT_ID.iam.gserviceaccount.com"
echo "🔐 Granting Hosting admin and viewer roles to: $FIREBASE_ADM_SA"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$FIREBASE_ADM_SA" \
    --role="roles/firebasehosting.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$FIREBASE_ADM_SA" \
    --role="roles/run.viewer"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$FIREBASE_ADM_SA" \
    --role="roles/cloudfunctions.viewer"

# Create a key for the service account
echo "🔑 Creating service account key..."
gcloud iam service-accounts keys create cloudbuild-deployer-key.json \
    --iam-account=cloudbuild-deployer@$PROJECT_ID.iam.gserviceaccount.com

echo "✅ GCP setup completed successfully!"
echo ""
echo "🔐 Service account permissions granted:"
echo "   - Cloud Run Admin (deploy to Cloud Run)"
echo "   - Service Account User (impersonate other service accounts)"
echo "   - Storage Admin (access build artifacts)"
echo "   - Artifact Registry Admin (create/manage Docker repositories)"
echo "   - Cloud Build Service Account (run builds)"
echo ""
echo "📋 Next steps:"
echo "1. Add the following secrets to your GitHub repository:"
echo "   - GCP_SA_KEY: Content of cloudbuild-deployer-key.json"
echo "   - FIREBASE_SERVICE_ACCOUNT or FIREBASE_TOKEN (for Hosting deploys)"
echo "   - QUARKUS_DATASOURCE_JDBC_URL: jdbc:postgresql:///$DB_NAME?cloudSqlInstance=$PROJECT_ID:$REGION:corepadel-db&socketFactory=com.google.cloud.sql.postgres.SocketFactory"
echo "   - QUARKUS_DATASOURCE_USERNAME: $DB_USER"
echo "   - QUARKUS_DATASOURCE_PASSWORD: $DB_PASSWORD"
echo ""
echo "2. Run database migrations:"
echo "   gcloud sql connect corepadel-db --user=$DB_USER --database=$DB_NAME"
echo ""
echo "3. Deploy your application:"
echo "   - Push to main branch to trigger GitHub Actions deployment"
echo "   - Or run: gcloud builds submit --config cloudbuild.yaml"
echo ""
echo "🔐 IMPORTANT: Keep the generated password secure and update your application configuration!"
