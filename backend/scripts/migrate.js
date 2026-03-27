const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const migrate = async () => {
  try {
    await client.connect();
    console.log('Connected to database');

    const query = `
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS plot_shape VARCHAR(50),
      ADD COLUMN IF NOT EXISTS road_width DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS facing VARCHAR(20),
      ADD COLUMN IF NOT EXISTS water_connection BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS electricity_connection BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS soil_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS water_availability BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS irrigation_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS electricity_available BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS tree_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS tree_stage VARCHAR(50),
      ADD COLUMN IF NOT EXISTS amenity_credits JSONB DEFAULT '{}';
    `;

    await client.query(query);
    console.log('Migration successful: Added new property fields.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
};

migrate();
