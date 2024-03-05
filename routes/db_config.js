// db_config.js

const { Pool } = require('pg');
const { spawn } = require('child_process');
const { User } = require('../models/userModel.js');
const app = require('../server.js');

const initializeDatabase = (app) => {
  // Route handler to handle incoming POST requests containing user data
  app.post('/user-data', (req, res) => {
    // Assuming req.body contains the user data sent from the Python script
    const userData = req.body;
    console.log('Received user data:', userData);
    res.status(200).send('User data received successfully.');
  });

  // Define a route that triggers the execution of the Python script
  app.post('/execute-python-script', async (req, res) => {
    // Access the request body
    const requestBody = req.body;

    // Log the request body
    console.log('Request Body:', requestBody);

    // Execute the Python script
    const pythonProcess = spawn('python', ['./retrieving_database_user_information/db_connecting_retrieval_credentials.py']);

    pythonProcess.stdout.on('data', async (data) => {
      console.log(`stdout: ${data}`);
      // Synchronize the user table and log current users after executing the Python script
      await synchronizeUserTable();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python script process exited with code ${code}`);
    });

    // Send a response back to the client
    res.send('Python script execution triggered.');
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

const logCurrentUsers = async(users) => {
  try {
    const timestamp = new Date().toLocaleString();
    console.log(`Current users in the database at ${timestamp}:`, users);
  } catch(error) {
    console.error('Error fetching current users: ', error);
  }
};

// Pool configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '192.168.100.53',
  database: process.env.DB_NAME || 'AccountCreation',
  password: process.env.DB_PASSWORD || 'MainAdministrator',
  port: process.env.DB_PORT || '5432'
});

// Exporting the functions and the pool
module.exports = { initializeDatabase, pool, synchronizeUserTable };
