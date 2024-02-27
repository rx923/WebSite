const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const path = require('path');
const cors = require('cors'); // Import cors module
const { createUser, User } = require('../routes/creation_of_user_accounts');

app.set("views", "./views");
app.use(cookie());
app.use(express.json());
app.use("/api", require("./controllers/auth"));

// Middleware
// Use cors middleware to handle CORS
router.use(cors()); 

router.use(bodyParser.json());
router.use(express.json());
router.use(express.static(path.join(__dirname, 'public')));

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
router.get('/routes', (req, res) =>{
    res.sendFile(path.join(__dirname, 'WebSite', 'routes', 'index.js'))
})

module.exports = router;
