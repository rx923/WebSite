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

const synchronizeUserTable = () => {

const synchronizeUserTable = async () => {
  try {
      // Synchronize the User table
      await User.sync();
      console.log('User table synchronized successfully.');
  } catch (error) {
      console.error('Unable to synchronize User table:', error);
  }
};

cron.schedule('*/10 * * * * ', synchronizeUserTable);

module.exports = {pool};
