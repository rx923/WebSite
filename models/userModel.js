const express = require('express');
const router = express.Router();
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('./userModel');
const path = require('path');

const app = express();

// Generate a random secret for session
const generateRandomSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Configure session
app.use(session({
    secret: generateRandomSecret(), // Use randomly generated secret
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // Session duration: 10 minutes (in milliseconds)
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
    res.sendFile(path.join(__dirname, './public/logged_in.html'));
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
