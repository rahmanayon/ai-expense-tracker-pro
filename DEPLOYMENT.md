# 1. Clone repository
git clone https://github.com/yourorg/expense-tracker-pro.git
cd expense-tracker-pro

# 2. Configure environment
cp .env.example .env
# Edit .env with your secrets

# 3. Build and run
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Database migrations
docker-compose exec backend npm run migrate

# 5. Verify deployment
curl http://localhost:3000/api/health

# 6. SSL with Let's Encrypt
docker-compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d