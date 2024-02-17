const express = require('express');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const port = 3000;

// Configure PostgreSQL client
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Route to handle form submission
app.post('/InregistrareForm', async (req, res) => {
    const { email, password, password_repeat } = req.body;

    // Check if passwords match
    if (password !== password_repeat) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        await client.connect();

        // Insert user into database
        const query = `
            INSERT INTO users (email, password)
            VALUES ($1, $2)
            RETURNING *`;
        const values = [email, password];
        const result = await client.query(query, values);

        res.status(200).send('Account created successfully');
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).send('Internal server error');
    } finally {
        await client.end();
    }
});

// Start server
app.listen(port, HOST, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
