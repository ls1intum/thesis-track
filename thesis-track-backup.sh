#!/bin/bash

# Configuration
BACKUP_DIR="./backups"  # Directory to store backups
DB_CONTAINER="thesis-track-db"  # PostgreSQL container name
UPLOADS_DIR="./thesis_uploads"  # Path to thesis_uploads folder
DB_USER=$(grep SPRING_DATASOURCE_USERNAME .env.prod | cut -d '=' -f 2)  # Extract DB user from .env.prod
DB_NAME=$(grep SPRING_DATASOURCE_DATABASE .env.prod | cut -d '=' -f 2)  # Extract DB name from .env.prod
DB_PASSWORD=$(grep SPRING_DATASOURCE_PASSWORD .env.prod | cut -d '=' -f 2)  # Extract DB password from .env.prod
DATE=$(date +"%Y%m%d_%H%M%S")  # Timestamp for the backup file
BACKUP_FILE="backup_$DATE.zip"  # Name of the backup file

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Remove backups older than 7 days
find $BACKUP_DIR -type f -mtime +7 -name "*.zip" -exec rm -f {} \;

echo "Starting backup..."

# Dump PostgreSQL database
echo "Backing up PostgreSQL database..."
docker exec -e PGPASSWORD=$DB_PASSWORD $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/db_backup_$DATE.sql"
if [ $? -ne 0 ]; then
  echo "Error: Database backup failed!"
  exit 1
fi

# Copy thesis_uploads folder
echo "Backing up thesis_uploads folder..."
UPLOADS_BACKUP_DIR="$BACKUP_DIR/uploads_$DATE"
cp -r $UPLOADS_DIR $UPLOADS_BACKUP_DIR
if [ $? -ne 0 ]; then
  echo "Error: thesis_uploads folder backup failed!"
  exit 1
fi

# Create a compressed zip file
echo "Compressing backups into $BACKUP_FILE..."
zip -r "$BACKUP_DIR/$BACKUP_FILE" "$BACKUP_DIR/db_backup_$DATE.sql" "$UPLOADS_BACKUP_DIR"
if [ $? -ne 0 ]; then
  echo "Error: Compression failed!"
  exit 1
fi

# Clean up intermediate files
echo "Cleaning up temporary files..."
rm -f "$BACKUP_DIR/db_backup_$DATE.sql"
rm -rf "$UPLOADS_BACKUP_DIR"

echo "Backup completed successfully. File stored at $BACKUP_DIR/$BACKUP_FILE."
