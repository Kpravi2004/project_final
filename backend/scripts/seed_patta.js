const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const seed = async () => {
  try {
    await client.connect();
    console.log('Connected to database');

    const query = `
      INSERT INTO mock_patta (survey_number, village, taluk, district, patta_number, owner_name, area, latitude, longitude)
      VALUES 
      ('123/4A', 'Melnila', 'Madurai West', 'Madurai', 'P-1001', 'Arun Kumar', 2.5, 9.9252, 78.1198),
      ('456/7B', 'Solaimalai', 'Melur', 'Madurai', 'P-1002', 'Vijayan', 1200, 9.9189, 78.1226)
      ON CONFLICT DO NOTHING;
    `;

    await client.query(query);
    console.log('Seed successful: Added mock patta records.');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await client.end();
  }
};

seed();
