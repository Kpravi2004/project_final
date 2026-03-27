const app = require('./app');
const env = require('./config/env');
const db = require('./config/database');

const startServer = async () => {
  try {
    // Check database connection
    const res = await db.query('SELECT NOW()');
    console.log(`Database connected successfully at ${res.rows[0].now}`);

    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server due to database connection issue', err);
    process.exit(1);
  }
};

startServer();
