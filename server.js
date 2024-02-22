const express = require('express');
const cors = require("cors");
// const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const { METHODS } = require('http');
const { User, createUser } = require('./public/models/users');
var http = require('http')
const HOST = '192.168.100.53';
const PORT = process.env.PORT || 8081;

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', 'css')));
app.use('/css', express.static(path.join(__dirname, 'public', 'Inregistrare.html')));

app.get('/InregistrareForm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inregistrare.html'));
});


// Define route to handle user registration
app.post('/InregistrareForm/', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Call createUser function to create a new user
        const newUser = await User.create({ username, email, password });
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        // Sending server error if it fails to create the new user
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`Server is listening on ${HOST}:${PORT}`);
    // Call createUser function to create a new user
    createUser();
});

createUser();