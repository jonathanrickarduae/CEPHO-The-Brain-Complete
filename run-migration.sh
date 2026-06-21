#!/bin/bash
# Script to run database migration for generated_documents table

echo "Running migration: 0031_add_generated_documents.sql"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Extract database connection details from DATABASE_URL
# Format: postgres://user:password@host:port/database

# Run the migration using psql or mysql depending on the database type
if [[ $DATABASE_URL == postgres* ]]; then
  echo "Detected PostgreSQL database"
  psql "$DATABASE_URL" < drizzle/0031_add_generated_documents.sql
elif [[ $DATABASE_URL == mysql* ]]; then
  echo "Detected MySQL database"
  mysql --defaults-extra-file=<(echo -e "[client]\npassword=$DB_PASSWORD") -h "$DB_HOST" -u "$DB_USER" "$DB_NAME" < drizzle/0031_add_generated_documents.sql
else
  echo "ERROR: Unsupported database type in DATABASE_URL"
  exit 1
fi

echo "Migration completed successfully"
