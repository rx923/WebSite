const express = require('express');
const { Client } = require('pg');

// Create an Express application
const app = express();
const port = 3000; // Define the port number to listen on

// Setting up the connection parameters
const client = new Client({
    user: 'postgres',
    host: '192.168.100.53',
    database: 'postgres',
    password: 'MainAdministrator',
    port: 5432,
});

// Connect to the PostgreSQL server
client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
    })
    .catch(err => {
        console.error('Error connecting to PostgreSQL:', err);
    });

// Define a route to handle POST requests for account creation
app.post('/create-account', (req, res) => {
    // Extract email and password from the request body
    const { email, password, password_repeat } = req.body;

    // Check if passwords match
    if (password !== password_repeat) {
        return res.status(400).send('Passwords do not match');
    }

    // Insert the user data into the database
    const query = 'INSERT INTO users (email, password) VALUES ($1, $2)';
    const values = [email, password];

    client.query(query, values)
        .then(() => {
            res.status(201).send('Account created successfully');
        })
        .catch(err => {
            console.error('Error creating account:', err);
            res.status(500).send('Internal server error');
        });
});

// Start the Express server and listen for incoming requests
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
