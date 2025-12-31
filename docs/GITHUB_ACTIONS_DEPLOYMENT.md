# GitHub Actions Deployment Guide

This guide explains how to set up automated build and deployment to Google Cloud Platform (GCE) using GitHub Actions.

## Overview

The deployment workflow:
1. **Build**: Builds the Docker image for the server and pushes it to GitHub Container Registry (GHCR)
2. **Deploy**: SSHs into the GCE instance and updates the running containers

## Prerequisites

1. **Google Cloud Project** with billing enabled
2. **GCE e2-micro instance** running Ubuntu/Debian
3. **GitHub Repository** with Actions enabled
4. **Service Account** with necessary permissions

## Setup Steps

### 1. Create Google Cloud Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions-deploy \
    --display-name="GitHub Actions Deployment"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/compute.instanceAdmin.v1"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 2. GitHub Container Registry Setup

No additional setup needed! The workflow uses GitHub Container Registry (GHCR) which is automatically available for your repository. Images will be published to `ghcr.io/<your-org>/<your-repo>/server`.

**Note**: Make sure your repository has GitHub Packages enabled (Settings → General → Features → Packages).

### 3. Set Up GCE Instance

```bash
# Create instance
gcloud compute instances create video-app-instance \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --boot-disk-size=20GB \
    --boot-disk-type=pd-standard \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --tags=http-server,https-server

# Add firewall rules
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --target-tags http-server

gcloud compute firewall-rules create allow-https \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --target-tags https-server
```

### 4. Prepare GCE Instance

SSH into your instance and run:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/video-app/config
sudo chown -R $USER:$USER /opt/video-app
```

### 5. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `GCP_PROJECT_ID` | Your GCP project ID | `my-project-12345` |
| `GCP_SA_KEY` | Service account JSON key (full content) | `{"type":"service_account",...}` |
| `GCE_INSTANCE_NAME` | GCE instance name | `video-app-instance` |
| `GCE_INSTANCE_ZONE` | GCE instance zone | `us-central1-a` |
| `GCE_SSH_USER` | SSH username for GCE | `ubuntu` or `your-username` |
| `GCE_INSTANCE_URL` | (Optional) Public URL of your instance | `https://your-domain.com` |

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions - no need to set it manually.

**To get GCP_SA_KEY:**
```bash
cat github-actions-key.json | jq -c
# Copy the entire output
```

### 6. Environment Variables (Optional)

For production environment secrets, add environment-specific variables:

- `JWT_SECRET`: Your JWT secret key
- `JWT_REFRESH_SECRET`: Your JWT refresh secret key
- `POSTGRES_PASSWORD`: Database password
- `REDIS_PASSWORD`: Redis password
- `PGADMIN_PASSWORD`: PgAdmin password

## Workflow Trigger

The workflow triggers on:
- Push to `main` or `master` branch
- Manual trigger via GitHub Actions UI (workflow_dispatch)

## Deployment Process

1. **Build Job**:
   - Checks out code
   - Authenticates with GitHub Container Registry (GHCR)
   - Builds Docker image
   - Pushes to GHCR (`ghcr.io/<org>/<repo>/server`)

2. **Deploy Job**:
   - Generates temporary SSH key
   - Adds SSH key to GCE instance
   - Copies deployment files
   - Executes deployment script
   - Verifies deployment

## Troubleshooting

### SSH Connection Issues

If SSH fails, ensure:
- GCE instance allows SSH (default firewall rules)
- Service account has `compute.instances.addAccessConfig` permission
- Instance metadata allows SSH keys

### Docker Image Pull Issues

If image pull fails:
```bash
# On GCE instance, manually authenticate to GHCR:
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Or create a Personal Access Token (PAT) with read:packages permission
# Settings → Developer settings → Personal access tokens → Tokens (classic)
```

### Permission Errors

Ensure the service account has:
- `compute.instanceAdmin.v1`
- `iam.serviceAccountUser`

**For GHCR**: Make sure your repository's GitHub Packages are accessible. If using a private repo, ensure the GCE instance can authenticate (the workflow handles this automatically during deployment).

### Disk Space Issues (e2-micro)

The e2-micro instance has limited resources:
```bash
# Clean up old Docker images periodically
docker system prune -af
docker volume prune -f
```

## Manual Deployment

To deploy manually without GitHub Actions:

```bash
# On your local machine
export IMAGE_URL="ghcr.io/YOUR_ORG/YOUR_REPO/server:latest"
export GITHUB_TOKEN="your_github_token"

# Copy files to server
scp infra/prod/docker-compose.yml user@instance:/opt/video-app/
scp infra/prod/config/Caddyfile user@instance:/opt/video-app/config/

# SSH and deploy
ssh user@instance
cd /opt/video-app

# Authenticate to GHCR
echo "$GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Update docker-compose.yml with image
sed -i 's|image:.*SERVER_IMAGE.*|image: '"$IMAGE_URL"'|g' docker-compose.yml

# Deploy
docker-compose pull
docker-compose up -d
```

## Monitoring

Check deployment logs:
```bash
# On GCE instance
cd /opt/video-app
docker-compose logs -f server
tail -f deployment.log
```

## Security Best Practices

1. **Use strong secrets**: Generate strong passwords for all services
2. **Limit SSH access**: Use firewall rules to limit SSH access
3. **Regular updates**: Keep your GCE instance updated
4. **Backup volumes**: Regularly backup Docker volumes
5. **Monitor logs**: Set up log monitoring and alerts
6. **Rotate secrets**: Regularly rotate JWT secrets and passwords

## Cost Optimization

For e2-micro instances:
- Use Docker image caching
- Monitor disk usage
- Use lightweight base images
- Consider upgrading if resource constrained

## Support

For issues, check:
1. GitHub Actions logs
2. GCE instance logs: `journalctl -u docker`
3. Docker logs: `docker-compose logs`
4. Deployment log: `/opt/video-app/deployment.log`

