#!/bin/bash

###############################################################################
# Automated Database Backup Setup Script
# 
# This script configures automated daily backups for the Supabase PostgreSQL
# database with 30-day retention.
#
# Priority 2 - DB-03: Automated Backups
###############################################################################

set -e

echo "=== CEPHO.AI Database Backup Setup ==="
echo ""

# Extract database connection details from DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL before running this script"
  exit 1
fi

# Parse DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Create backup directory
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

echo "✓ Backup directory created: $BACKUP_DIR"

# Create backup script
cat > /home/ubuntu/backup-database.sh << 'EOF'
#!/bin/bash

###############################################################################
# Daily Database Backup Script
# 
# This script creates a compressed backup of the PostgreSQL database
# and maintains a 30-day retention policy.
###############################################################################

set -e

# Configuration
BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/cepho_backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=30

# Extract database connection details
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "[$(date)] Starting database backup..."

# Create backup
PGPASSWORD=$DB_PASS pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  | gzip > $BACKUP_FILE

# Check if backup was successful
if [ -f "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
  echo "[$(date)] ✓ Backup completed: $BACKUP_FILE ($BACKUP_SIZE)"
  
  # Delete backups older than retention period
  find $BACKUP_DIR -name "cepho_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
  echo "[$(date)] ✓ Cleaned up backups older than $RETENTION_DAYS days"
  
  # Log backup statistics
  BACKUP_COUNT=$(ls -1 $BACKUP_DIR/cepho_backup_*.sql.gz 2>/dev/null | wc -l)
  TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
  echo "[$(date)] Backup statistics: $BACKUP_COUNT backups, $TOTAL_SIZE total"
else
  echo "[$(date)] ✗ ERROR: Backup failed"
  exit 1
fi
EOF

chmod +x /home/ubuntu/backup-database.sh

echo "✓ Backup script created: /home/ubuntu/backup-database.sh"

# Create cron job for daily backups at 2 AM
CRON_JOB="0 2 * * * /home/ubuntu/backup-database.sh >> /home/ubuntu/backups/backup.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "backup-database.sh"; then
  echo "✓ Cron job already exists"
else
  # Add cron job
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  echo "✓ Cron job added: Daily backups at 2:00 AM"
fi

# Create backup restore script
cat > /home/ubuntu/restore-database.sh << 'EOF'
#!/bin/bash

###############################################################################
# Database Restore Script
# 
# Usage: ./restore-database.sh <backup_file>
# Example: ./restore-database.sh /home/ubuntu/backups/cepho_backup_20260225_020000.sql.gz
###############################################################################

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo ""
  echo "Available backups:"
  ls -lh /home/ubuntu/backups/cepho_backup_*.sql.gz 2>/dev/null || echo "  No backups found"
  exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Extract database connection details
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "WARNING: This will restore the database from backup and overwrite all current data!"
echo "Backup file: $BACKUP_FILE"
echo "Database: $DB_NAME on $DB_HOST"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled"
  exit 0
fi

echo "[$(date)] Starting database restore..."

# Restore backup
gunzip -c $BACKUP_FILE | PGPASSWORD=$DB_PASS psql \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME

echo "[$(date)] ✓ Database restored successfully"
EOF

chmod +x /home/ubuntu/restore-database.sh

echo "✓ Restore script created: /home/ubuntu/restore-database.sh"

# Test backup (create first backup)
echo ""
echo "Creating first backup..."
/home/ubuntu/backup-database.sh

echo ""
echo "=== Backup Setup Complete ==="
echo ""
echo "Configuration:"
echo "  Backup Directory: $BACKUP_DIR"
echo "  Schedule: Daily at 2:00 AM"
echo "  Retention: 30 days"
echo ""
echo "Scripts:"
echo "  Backup:  /home/ubuntu/backup-database.sh"
echo "  Restore: /home/ubuntu/restore-database.sh"
echo "  Setup:   /home/ubuntu/the-brain-main/scripts/setup-backups.sh"
echo ""
echo "Manual Commands:"
echo "  Create backup: /home/ubuntu/backup-database.sh"
echo "  List backups:  ls -lh $BACKUP_DIR"
echo "  Restore:       /home/ubuntu/restore-database.sh <backup_file>"
echo ""
echo "Logs:"
echo "  Backup log: $BACKUP_DIR/backup.log"
echo ""
echo "✓ Automated backups are now configured!"
