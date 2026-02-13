const { Client } = require('pg');

// Database 1: jonathanrickarduae's Project (old)
const db1 = {
  name: "jonathanrickarduae's Project",
  connectionString: "postgresql://postgres:kRprwWw1POruGx4J@db.uwyeubfgymgiabcuwikw.supabase.co:5432/postgres"
};

// Database 2: cepho-managed-dev (new, with IPv4)
const db2 = {
  name: "cepho-managed-dev",
  connectionString: "postgresql://postgres:DSKmnudqR4sP6giA@db.xgoxduebjnlsr1jzksvd.supabase.co:5432/postgres"
};

async function auditDatabase(dbConfig) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`AUDITING: ${dbConfig.name}`);
  console.log('='.repeat(80));
  
  const client = new Client({
    connectionString: dbConfig.connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connection successful\n');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`Found ${tablesResult.rows.length} tables:\n`);

    const tableStats = [];

    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      
      // Get row count
      const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const rowCount = parseInt(countResult.rows[0].count);

      // Get column info
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);

      tableStats.push({
        name: tableName,
        rowCount: rowCount,
        columns: columnsResult.rows.length
      });
    }

    // Print summary
    console.log('Table Name                          Rows    Columns');
    console.log('-'.repeat(60));
    for (const stat of tableStats) {
      console.log(`${stat.name.padEnd(35)} ${String(stat.rowCount).padStart(6)}  ${String(stat.columns).padStart(7)}`);
    }

    // Check for specific important tables
    console.log('\n--- Key Tables Check ---');
    const keyTables = ['users', 'conversations', 'projects', 'documents', 'ai_smes'];
    for (const table of keyTables) {
      const exists = tableStats.find(t => t.name === table);
      if (exists) {
        console.log(`✓ ${table}: ${exists.rowCount} rows`);
      } else {
        console.log(`✗ ${table}: NOT FOUND`);
      }
    }

  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('DATABASE AUDIT REPORT');
  console.log('Generated:', new Date().toISOString());
  
  await auditDatabase(db1);
  await auditDatabase(db2);

  console.log('\n' + '='.repeat(80));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(80));
}

main().catch(console.error);
