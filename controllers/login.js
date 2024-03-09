const bcrypt = require('bcryptjs');
const { generateRandomSecret } = require('./loggedin');
const User = require('../models/userModel.js');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('../routes/db_config');
const express = require('express');
const { response } = require('../server.js');
const crypto = require('crypto');
const router = express.Router();

// Configure session
const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
        tablename: 'sessions'
    }),
    // Use randomly generated secret
    secret: generateRandomSecret(),
    resave: false,
    saveUninitialized: true,
    // Session duration: 10 minutes (in milliseconds)
    cookie: { secure: false }
});

// Add session middleware to router
router.use(sessionMiddleware);

// Login function
const login = async (username, password) => {
    try {
        // Ensure both username and password are provided
        if (!username || !password) {
            return { success: false, message: "Username and password are required." };
        }

        // Find the user by username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return { success: false, message: "User not found." };
        }

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return { success: false, message: "Incorrect password." };
        }

        // If both username and password are provided and validated, return success
        return { success: true, user };
    } catch (err) {
        console.error('Error during login:', err);
        return { success: false, message: "Internal server error." };
    }
};
module.exports = { sessionMiddleware, login };