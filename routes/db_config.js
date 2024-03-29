const { Pool } = require('pg');
const { spawn } = require('child_process');
const { User } = require('../models/userModel.js');
const app = require('../server.js');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const crypto = require('crypto'); // Require the crypto module

// Pool configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '192.168.100.53',
  database: process.env.DB_NAME || 'AccountCreation',
  password: process.env.DB_PASSWORD || 'MainAdministrator',
  port: process.env.DB_PORT || '5432'
});

// Generate a random secret for session
const generateRandomSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Initialize the session store
const sessionStore = new pgSession({
  pool: pool,
  tableName: 'sessions'
});

// Configure session middleware
const configureSession = (app) => {
  app.use(session({
    store: sessionStore,
    // Use randomly generated secret
    secret: generateRandomSecret(),
    resave: false,
    saveUninitialized: true,
    // Session duration: 10 minutes (in milliseconds)
    cookie: { secure: false }
  }));
};

// Initialize database
const initializeDatabase = () => {
  pool.connect((err, client, release) => {
      if (err) {
          console.error('Error connecting to the database:', err);
      } else {
          console.log('Database connected successfully');
          client.query('SELECT * FROM users', (queryErr, result) => {
              if (queryErr) {
                  console.error('Error executing query:', queryErr);
              } else {
                  console.log('Query result:', result.rows);
              }
          });
          release();
      }
  });
};

const synchronizeUserTable = async () => {
  try {
    // Synchronize the User table
    await User.sync();
    console.log('User table synchronized successfully.');

    // Fetch data from the Users table
    const users = await User.findAll();
    console.log('Users:', users);

    // Log the current users
    await logCurrentUsers(users);
  } catch (error) {
    console.error('Unable to synchronize User table:', error);
  }
};

// const logCurrentUsers = async (users) => {
//   try {
//     const timestamp = new Date().toLocaleString();
//     console.log(`Current users in the database at ${timestamp}:`, users);
//   } catch (error) {
//     console.error('Error fetching current users: ', error);
//   }
// };

// Exporting the functions and the pool
module.exports = { initializeDatabase, pool, synchronizeUserTable, configureSession, sessionStore };
