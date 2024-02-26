const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const establishing_connection_routes = require('./establishing_connection_routes');
const server_authentication_routes = require('./server_authentication_routes');
const user_authentication_routes = require('./user_authentication_routes');
const User = require('./public/models/creation_of_user_accounts');

const app = express();
const router = express.Router();

app.use(bodyParser.json());

// Importing other route files
router.use('/', establishing_connection_routes.router);
router.use('/', server_authentication_routes.router);
router.use('/', user_authentication_routes.router);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle user registration
router.post('/', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Create user in the database
        const newUser = await User.create({
            username,
            email,
            password
        });

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
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
