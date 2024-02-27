const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { createUser, User } = require('./creation_of_user_accounts');



const app = express();
const router = express.Router();


app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle user registration
router.post('/register', async (req, res) => {
    try {
        // Check if email is provided
        if (!req.body.email) {
            throw new Error('Email is required.');
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ where: { email: req.body.email } });
        if (existingUser) {
            throw new Error('An account with this email already exists.');
        }

        // Access req.body directly after ensuring email is not already in use
        const { username, email, password } = req.body; 

        // Create user in the database
        const newUser = await createUser(username, email, password);

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: error.message });
    }
});


// Define other routes
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', 'index.html'));
});

// Use the router middleware
app.use('/', router);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
module.exports = { app, router };
