const { Pool } = require('pg');
const fs = require('fs');

const POSTGRES_URL = "postgresql://geolog_db_user:ylHsY5XyneCCQ8KLcApRNftOXg3mmmuw@dpg-d6gee5ogjchc73c3ee5g-a.oregon-postgres.render.com/geolog_db";

async function exportDrivers() {
  const pool = new Pool({ 
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao Postgres...');
    const res = await pool.query('SELECT * FROM drivers;');
    console.log(`✅ Exportadas ${res.rows.length} drivers`);
    
    const jsonOutput = JSON.stringify(res.rows, null, 2);
    console.log('\n📋 Drivers:');
    console.log(jsonOutput);
    
    // Salva em arquivo
    fs.writeFileSync('./drivers-backup.json', jsonOutput);
    console.log('\n✅ Salvo em: drivers-backup.json');
    
    await pool.end();
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

exportDrivers();
