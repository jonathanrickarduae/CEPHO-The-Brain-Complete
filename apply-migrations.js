// Script to apply database migrations
import { createConnection } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigrations() {
  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cepho',
    multipleStatements: true
  });

  console.log('Connected to database');

  try {
    const sqlFile = path.join(__dirname, 'create-missing-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Applying migrations...');
    await connection.query(sql);
    console.log('✅ Migrations applied successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

applyMigrations().catch(console.error);
