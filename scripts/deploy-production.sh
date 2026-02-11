#!/bin/bash
# scripts/deploy-production.sh
set -e
echo "🚀 Starting production deployment..."
VERSION=$(git rev-parse --short HEAD)
cd backend && docker build -t expense-tracker-backend:${VERSION} .
cd ../frontend && docker build -t expense-tracker-frontend:${VERSION} .
echo "Deploying to Kubernetes..."
kubectl set image deployment/expense-tracker-backend backend=expense-tracker-backend:${VERSION}
kubectl rollout status deployment/expense-tracker-backend
echo "✅ Deployment complete!"