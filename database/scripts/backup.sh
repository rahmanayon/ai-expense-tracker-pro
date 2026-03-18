#!/bin/bash
# database/scripts/backup.sh

# Configuration
DB_NAME="expense_tracker_pro"
DB_USER="expense_user"
BACKUP_DIR="/backups/database"
S3_BUCKET="expense-tracker-backups"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Create database backup
echo "Creating database backup..."
pg_dump -h localhost -U $DB_USER -d $DB_NAME --verbose --clean --if-exists --create | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup created successfully: $BACKUP_FILE"
    echo "Uploading to S3..."
    aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/database/
    if [ $? -eq 0 ]; then
        echo "Backup uploaded to S3 successfully"
        find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
        echo "Backup process completed successfully"
    else
        echo "Failed to upload backup to S3"
        exit 1
    fi
else
    echo "Database backup failed"
    exit 1
fi