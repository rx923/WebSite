const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '192.168.100.53',
  database: process.env.DB_NAME || 'AccountCreation',
  password: process.env.DB_PASSWORD || 'MainAdministrator',
  port: process.env.DB_PORT || '5432'
});

module.exports = { pool };
