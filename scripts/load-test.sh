# scripts/load-test.sh
echo "🚀 Starting load testing..."
# Installs k6 and runs a load test script with stages:
# Ramp up to 100 users, then 200, then ramp down.
# Thresholds: 99% of requests < 1.5s, Error rate < 10%.