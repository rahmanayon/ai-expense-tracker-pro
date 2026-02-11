#!/bin/bash
# scripts/security-audit.sh

echo "🔒 Running security audit..."

# Check for common vulnerabilities
echo "Running OWASP dependency check..."
docker run --rm -v "$PWD:/src" owasp/dependency-check --project "AI Expense Tracker" --scan /src --format "ALL"

# SSL/TLS Configuration Test
echo "Testing SSL configuration..."
nmap --script ssl-enum-ciphers -p 443 aiexpensetracker.com | grep -E "TLSv1.3|TLSv1.2"

# Security headers check
echo "Checking security headers..."
security_headers=(
  "Strict-Transport-Security"
  "X-Content-Type-Options"
  "X-Frame-Options"
  "X-XSS-Protection"
  "Content-Security-Policy"
  "Referrer-Policy"
  "Permissions-Policy"
)

for header in "${security_headers[@]}"; do
  if curl -s -I https://aiexpensetracker.com | grep -q "$header"; then
    echo "✅ $header present"
  else
    echo "❌ $header missing"
  fi
done