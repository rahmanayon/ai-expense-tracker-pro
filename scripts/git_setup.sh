# Complete production deployment
git clone https://github.com/yourorg/ai-expense-tracker-pro.git
cd ai-expense-tracker-pro

# Configure environment
cp .env.production .env
# Edit .env with your configuration

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to Kubernetes
kubectl apply -f infrastructure/k8s/