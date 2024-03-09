// authController.js
const bcrypt = require('bcryptjs');
// Adjust the path accordingly
const { createUser } = require('../routes/creation_of_user_accounts.js'); 
const User = require('../models/userModel.js');


const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Create the user
        const user = await createUser(username, email, password);
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Define the login function
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};


const authController = {
    register: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Check if the username already exists in the database
            const existingUser = await user.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Hash the password before saving it to the database
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user in the database
            const newUser = await User.create({ username, password: hashedPassword });

            res.status(201).json({ message: 'User registered successfully', user: newUser });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
    
            // Check if username and password are provided
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required.' });
            }
    
            // Find the user by username in the database
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(401).json({ error: 'User not found.' });
            }
    
            // Compare the provided password with the hashed password stored in the database
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
    
            // If the credentials are valid, create a session for the user
            req.session.user = { id: user.id, username: user.username, email: user.email };
            res.status(200).json({ message: 'Login successful', user: req.session.user });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    logout: async (req, res) => {
        try {
            // Destroy the session to log the user out
            req.session.destroy();
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
module.exports = { authController, isAuthenticated, register };

