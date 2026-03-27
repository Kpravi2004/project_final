require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  db: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'realestate_tn',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  },
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  geoapifyApiKey: process.env.GEOAPIFY_API_KEY
};
