require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/src/config/database');

async function fixSchema() {
  try {
    console.log('Adding missing columns to properties...');
    const columns = [
      'approval_number TEXT',
      'gated_community BOOLEAN',
      'corner_plot BOOLEAN',
      'landmarks TEXT',
      'soil_depth DECIMAL(6,2)',
      'road_access_type VARCHAR(50)',
      'distance_from_highway DECIMAL(8,2)',
      'fencing_details TEXT'
    ];

    for (const col of columns) {
      const colName = col.split(' ')[0];
      console.log(`Checking ${colName}...`);
      await db.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS ${col}`);
    }

    console.log('Database schema fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing schema:', err);
    process.exit(1);
  }
}

fixSchema();
