const express = require('express');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
const path = require('path');
const { pool } = require('../routes/db_config');
const app = express();

// Generate a random secret for session
const generateRandomSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Configure session
app.use(session({
    store: new pgSession ({
        pool:pool,
        tablename: 'sessions'
    }),
    // Use randomly generated secret
    secret: generateRandomSecret(), 
    resave: false,
    saveUninitialized: true,
    // Session duration: 10 minutes (in milliseconds)
    cookie: { secure: false } 
}));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// Route to handle access to protected resource
router.get('/protected', isAuthenticated, async (req, res) => {
    // Do something with the protected resource
});

// Route handler for user login
router.get('/logged_in', (req, res) => {
    // Example: Get the username from the request
    const username = req.session.user.username;

    // Example: Send the logged_in.html file along with the username as a query parameter
    res.sendFile(path.join(__dirname, './public/logged_in.html') + `?username=${username}`);
});

// Route handler for user logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ message: 'Logout successful' });
        }
    });
});

// Export the router
module.exports = router;