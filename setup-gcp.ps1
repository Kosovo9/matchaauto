
# 🚀 Match-Auto GCP Infrastructure Setup Script (v2 - Bulletproof)
# Run this once after 'gcloud auth login' and 'gcloud config set project [ID]'

$PROJECT_ID = gcloud config get-value project
$REGION = "us-central1"
$SQL_INSTANCE = "matchaauto-staging-pg"
$DB_NAME = "matchaauto_staging"
$DB_USER = "app"
$DB_PASS = "MatchAuto10x!" # ⚠️ You will update this in Secret Manager
$AR_REPO = "matchaauto"
$RUN_SA = "matchaauto-run-sa"
$MIGRATE_JOB_NAME = "matchaauto-migrate-staging"

Write-Host "--- Enabling APIs ---" -ForegroundColor Cyan
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com

Write-Host "--- Creating Artifact Registry ---" -ForegroundColor Cyan
gcloud artifacts repositories create $AR_REPO --repository-format=docker --location=$REGION --quiet

Write-Host "--- Creating Cloud SQL Instance (Postgres 16) ---" -ForegroundColor Cyan
gcloud sql instances create $SQL_INSTANCE --database-version=POSTGRES_16 --region=$REGION --cpu=2 --memory=4GB --storage-size=50GB --availability-type=zonal --quiet

Write-Host "--- Creating Database and User ---" -ForegroundColor Cyan
gcloud sql databases create $DB_NAME --instance=$SQL_INSTANCE
gcloud sql users create $DB_USER --instance=$SQL_INSTANCE --password=$DB_PASS

$INSTANCE_CONNECTION_NAME = gcloud sql instances describe $SQL_INSTANCE --format="value(connectionName)"

Write-Host "--- Setting up Service Account ---" -ForegroundColor Cyan
gcloud iam service-accounts create $RUN_SA --display-name="MatchAuto Cloud Run SA"
$RUN_SA_EMAIL = "$RUN_SA@$PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$RUN_SA_EMAIL" --role="roles/cloudsql.client"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$RUN_SA_EMAIL" --role="roles/secretmanager.secretAccessor"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$RUN_SA_EMAIL" --role="roles/artifactregistry.reader"

Write-Host "--- Initializing Secrets (Security Hardened) ---" -ForegroundColor Cyan

# 🔐 DATABASE_URL (Standard format for Unix Socket)
$DB_URL = "postgresql://$DB_USER:$DB_PASS@/$DB_NAME?host=/cloudsql/$INSTANCE_CONNECTION_NAME"
Write-Host "Initializing DATABASE_URL secret..."
$DB_URL | gcloud secrets create DATABASE_URL --data-file=- --quiet

$Secrets = @("CLERK_SECRET_KEY", "MERCADO_PAGO_ACCESS_TOKEN", "PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID", "ADMIN_USER_IDS")
foreach ($s in $Secrets) {
    Write-Host "Initializing secret: $s"
    "placeholder" | gcloud secrets create $s --data-file=- --quiet
}

Write-Host "--- Pre-creating Migration Job ---" -ForegroundColor Cyan
# We create a dummy version first so Cloud Build can 'update' it.
gcloud run jobs create $MIGRATE_JOB_NAME --image="us-docker.pkg.dev/cloudrun/container/placeholder" --region=$REGION --quiet

Write-Host "`n✅ Infrastructure Ready!" -ForegroundColor Green
Write-Host "Next Step: Run 'gcloud builds submit . --config cloudbuild.yaml --substitutions=_INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME'" -ForegroundColor Yellow
Write-Host "PRO TIP: Go to GCP Console -> Secret Manager and update ALL placeholders with real keys!" -ForegroundColor White
