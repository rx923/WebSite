const express = require('express');
const cors = require("cors");
const path = require('path');
const { Pool } = require('pg');
const { createUser } = require('./public/routes/creation_of_user_accounts');


const app = express();
const PORT = process.env.PORT || 8081;
const HOST = '192.168.100.53';

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '192.168.100.53',
  database: process.env.DB_NAME || 'AccountCreation',
  password: process.env.DB_PASSWORD || 'MainAdministrator',
  port: process.env.DB_PORT || '5432'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', 'css')));
app.use(express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public')));

// Test database connection
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Database connected successfully');

        // Check if users table exists
        pool.query(`SELECT to_regclass('public.users')`, (err, result) => {
        if (err) {
            console.error('Error checking for users table:', err);
        } else {
            if (result.rows[0].to_regclass) {
            console.log('Table users already exists. Did not create another table.');
            } else {
            // Create users table if it doesn't exist
            pool.query(`
                CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(200) NOT NULL,
                password VARCHAR(200) NOT NULL,
                email VARCHAR(200) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `, (err, result) => {
                if (err) {
                console.error('Error creating users table:', err);
                } else {
                console.log('Users table created successfully');
                }
            });
            }
        }
        });
    }
    });
  
// Homepage route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});


// Retrieve user information from the database
app.get('/users', (req, res) => {
  pool.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows);
    }
  });
});

// Password reset endpoint (example)
app.post('/reset-password', (req, res) => {
  // Handle password reset logic here
  res.send('Password reset functionality will be implemented here');
});

// Create user endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      // Use the createUser function to create a new user
      const newUser = await createUser(username, email, password);
      console.log('User Created successfully:', newUser);
      res.status(201).json({message: 'User created successfully', user: newUser});
    } catch (error) {
      console.error('Error creating user:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  
// Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server is listening on http://${HOST}:${PORT}`);
});
