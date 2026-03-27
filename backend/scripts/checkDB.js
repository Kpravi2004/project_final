const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'sankar2005',
    port: process.env.DB_PORT || 5432,
    database: 'realestate_tn'
  };

  const client = new Client(config);
  try {
    await client.connect();
    
    console.log('--- DATA FROM land_types ---');
    const landTypes = await client.query('SELECT * FROM land_types');
    console.table(landTypes.rows);
    
    console.log('\n--- DATA FROM property_status ---');
    const propertyStatus = await client.query('SELECT * FROM property_status');
    console.table(propertyStatus.rows);

  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  } finally {
    await client.end();
  }
}

check();
