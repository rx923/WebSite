const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User } = require("../models/userModel.js"); 

// Define the login function
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if both username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide both username and password.' });
        }

        // Find the user in the database by username
        const user = await User.findOne({ where: { username } });

        // If user doesn't exist, return error
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // If passwords match, generate JWT token
        if (isPasswordValid) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            // You can set the token as a cookie or send it in the response
            res.cookie('jwt', token); // Example of setting token as a cookie
            res.status(200).json({ message: 'Login successful.' });
        } else {
            // If passwords don't match, return error
            return res.status(401).json({ message: 'Invalid password.' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

const logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).redirect('/');
};



