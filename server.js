const express = require('express');
const cors = require("cors");
const router = require('./views/index.js'); 
const path = require('path');
const { Pool } = require('pg');
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
app.use("/", require("./routes/pages"));
app.use(cors());
app.use(express.json());
// Mount the router here
// Assuming 'router' is correctly exported from './routes/index'
// app.use('/', router);
// Mount the router at '/api' base path
app.use('/api', router); 
app.use('/css', express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', 'css')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'routes')));


// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Database connected successfully');

        // Check if users table exists
        client.query(`SELECT to_regclass('public.users')`, (err, result) => {
            release(); // Release the client back to the pool
            if (err) {
                console.error('Error checking for users table:', err);
            } else {
                if (result.rows[0].to_regclass) {
                    console.log('Table users already exists. Did not create another table.');
                } else {
                    // Create users table if it doesn't exist
                    const createTableQuery = `
                        CREATE TABLE users (
                            id SERIAL PRIMARY KEY,
                            username VARCHAR(200) NOT NULL,
                            password VARCHAR(200) NOT NULL,
                            email VARCHAR(200) NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                        
                        CREATE OR REPLACE FUNCTION update_timestamp()
                        RETURNS TRIGGER AS $$
                        BEGIN
                            NEW.updated_at = CURRENT_TIMESTAMP;
                            RETURN NEW;
                        END;
                        $$ LANGUAGE plpgsql;
                        
                        CREATE TRIGGER users_update_trigger
                        BEFORE UPDATE ON users
                        FOR EACH ROW
                        EXECUTE FUNCTION update_timestamp();
                    `;

                    client.query(createTableQuery, (err, result) => {
                        if (err) {
                            console.error('Error creating users table:', err);
                        } else {
                            console.log('Users table created successfully', result);
                        }
                    });
                }
            }
        });
    }
});

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
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
app.post('/register', (req, res) => {
    try {
        const { username, email, password, password_repeat } = req.body;

        // Check if email, username, and password are provided
        if (!email || !username || !password || !password_repeat) {
            return res.status(400).json({ error: 'Email, username, and password are required.' });
        }

        // Check if passwords match
        if (password !== password_repeat) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        // Send a JSON response indicating success
        res.status(201).json({ message: 'User registration request received.', username, email });
    } catch (error) {
        console.error('Error processing registration request:', error.message);

        // Send a JSON response indicating error
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, HOST, () => {
  console.log(`Server is listening on http://${HOST}:${PORT}`);
});
