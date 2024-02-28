const express = require("express");
const authController = require("../controllers/auth.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const pool = require("../db_config");
const path = require("path"); // Added path module for file operations

// Define the register function
exports.register = async (req, res) => {
    console.log(req.body);
    const { name, email, password, passwordConfirm } = req.body;

    try {
        // Check if email already exists in the database
        const emailCheck = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
        
        // If email already exists, return an error message
        if (emailCheck.rows.length > 0) {
            return res.sendFile(path.join(__dirname, "request.html"), { // Modified file path using path.join
                message: 'The email is already in use'
            });
        } 
        
        // Check if password and passwordConfirm match
        if (password !== passwordConfirm) {
            return res.sendFile(path.join(__dirname, "request.html"), { // Modified file path using path.join
                message: 'Passwords do not match'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        // Insert user into the database
        await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);

        // Redirect to a success page
        return res.sendFile(path.join(__dirname, "request.html"), { // Modified file path using path.join
            message: 'User registered'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

// Define the login function
exports.login = async (req, res) => {
    // Your login function implementation
};

// Define the logout function
exports.logout = (req, res) => {
    // Your logout function implementation
};

const router = express.Router();

router.post('/Inregistrare', authController.register);
router.post('/Logare', authController.login);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
