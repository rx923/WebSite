const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const { pool, dotenv } = require('./views/index'); // Import pool and dotenv from index.js

const app = express();
// const PORT = process.env.PORT || 8081;
// const HOST = '192.168.100.53';

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'html');

const db = psql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((err)=>{
    if (err) {
        console.log(err);
    } else {
        console.log('PSQL Connected')
    }
})



app.use(cors());
app.use(express.json());
app.use('/css', express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', 'css')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'routes')));
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Database connected successfully');
        // Release the client back to the pool
        release();
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

app.listen(8081)
