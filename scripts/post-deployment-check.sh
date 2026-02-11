#!/bin/bash
# scripts/post-deployment-check.sh
echo "🔍 Running post-deployment verification..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.aiexpensetracker.com/health)
if [ $HEALTH_STATUS -eq 200 ]; then
  echo "✅ API Health: OK"
else
  echo "❌ API Health: Failed ($HEALTH_STATUS)"
  exit 1
fi