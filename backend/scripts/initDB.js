const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function init() {
  const config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'sankar2005',
    port: process.env.DB_PORT || 5432,
    database: 'postgres'
  };

  console.log('Connecting to default postgres database...');
  const client1 = new Client(config);
  try {
    await client1.connect();
    console.log('Checking if reali_estate exists...');
    const res = await client1.query("SELECT 1 FROM pg_database WHERE datname='reali_estate'");
    if (res.rows.length === 0) {
      console.log('Creating reali_estate database...');
      await client1.query('CREATE DATABASE reali_estate');
      console.log('Database created successfully.');
    } else {
      console.log('Database reali_estate already exists.');
    }
  } catch (err) {
    if (err.code !== '42P04') { // 42P04 is duplicate_database
      console.error('Error in creating DB:', err);
    }
  } finally {
    await client1.end();
  }

  console.log('Connecting to reali_estate database...');
  const client2 = new Client({ ...config, database: 'reali_estate' });
  try {
    await client2.connect();
    console.log('Connected. Running init.sql script...');
    const sql = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf-8');
    await client2.query(sql);
    console.log('init.sql executed successfully! Database is ready!');
  } catch (err) {
    console.error('Error executing init.sql:', err.message || err);
  } finally {
    await client2.end();
  }
}

init();
