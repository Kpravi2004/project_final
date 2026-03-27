require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/src/config/database');

async function updateSchema() {
  try {
    console.log('Adding "amenities_requested" status...');
    await db.query(`
      INSERT INTO property_status (status) VALUES ('amenities_requested') 
      ON CONFLICT DO NOTHING
    `);

    console.log('Adding amenities_request_note to properties...');
    await db.query(`
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities_request_note TEXT
    `);

    console.log('Adding user_provided_amenities to properties...');
    await db.query(`
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS user_provided_amenities JSONB
    `);

    console.log('Database schema updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating schema:', err);
    process.exit(1);
  }
}

updateSchema();
