const express = require('express');
const router = express.Router();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const crypto = require('crypto');
const User = require('../models/userModel');
const path = require('path');
const { pool } = require('../routes/db_config');
const { mapSessionToUser } = require('../path/to/mapSessionToUser');
const { registerUser } = require('./auth.js');
const { authenticateAndGenerateToken } = require('./controllers/auth.js');



// Generate a random secret for session
const generateRandomSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};
secretKey = generateRandomSecret;

// Configure session
const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
        tablename: 'sessions'
    }),
    // Use randomly generated secret
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    // Session duration: 10 minutes (in milliseconds)
    cookie: { 
        secure: false,
        maxAge: 10 * 60 * 1000
    },
    genid: async (req) => {
        try {
            // Check if the user is authenticated
            if (req.session && req.session.userId) {
                // Retrieve the user ID from the session
                const userId = req.session.userId;
    
                // Query the database to check if the user exists
                const user = await User.findByPk(userId);
    
                // If the user exists, generate a session ID based on their unique identifier
                if (user) {
                    return crypto.createHash('sha256').update(userId.toString()).digest('hex');
                }
            }
            
            // If the user is not authenticated or not found in the database, fallback to generating a random ID
            return crypto.randomBytes(16).toString('hex');
        } catch (error) {
            console.error('Error generating session ID:', error);
            // Fallback to generating a random ID in case of an error
            return crypto.randomBytes(16).toString('hex');
        }
    }
});

// Add session middleware to router
router.use(sessionMiddleware);

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
router.post('/login', async (req, res) => {
    // Check if username and password are provided
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // Authenticate the user and generate token
        const { token, user } = await authenticateAndGenerateToken(username, password);

        // Set user ID in the session using the correct column name 'user_id'
        req.session.user_id = user.id;

        // Map the session to the user's ID
        await mapSessionToUser(req.session.id, user.id);

        // Redirect to the appropriate page after successful login
        res.redirect('/logged_in.html');
    } catch (error) {
        if (error.message.includes('An account with this email already exists.')) {
            // Handle the case where the email is already in use
            res.status(400).json({ error: 'An account with this email already exists.' });
        } else if (error.message.includes('An account with this username already exists.')) {
            // Handle the case where the username is already in use
            res.status(400).json({ error: 'An account with this username already exists.' });
        } else {
            // Handle other unexpected errors
            console.error('Error logging in user:', error);
            res.status(401).json({ error: 'Invalid username or password.' });
        }
    }
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
    if (req.session && req.session.user) {
        console.log(`User ${req.session.user.username} logged out`);
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.status(200).json({ message: 'Logout successful' });
        }
    });
});

// Function to print logged-in sessions
const printLoggedInSessions = async (pool) => {
    try {
        // Query the database for active sessions
        const activeSessions = await pool.query('SELECT * FROM sessions JOIN users_table ON sessions.user_id = users_table.id WHERE');

        // Process the active sessions
        if (activeSessions && activeSessions.rows) {
            console.log('Active Sessions:');
            activeSessions.rows.forEach(session => {
                console.log(`Session ID: ${session.id}, User: ${session.user}`);
            });
        }
    } catch (error) {
        console.error('Error retrieving active sessions:', error);
    }
};

// Export the router and session middleware along with the function to print logged-in sessions
module.exports = { router, sessionMiddleware, printLoggedInSessions, generateRandomSecret };