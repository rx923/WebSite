// authController.js
const bcrypt = require('bcryptjs');
// Adjust the path accordingly
const { User } = require('../models/userModel.js');



const authenticateAndCompare = async (username, password) => {
    try {
        // Find the user by username in the database
        const user = await User.findByUsername(username);
        if (!user) {
            // User not found
            return null;
        }
        console.log(username);

        // Use bcrypt to compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Passwords do not match
            return null;
        }
        console.log(isPasswordValid);

        // Passwords match, return the user object
        return user;
    } catch (error) {
        console.error('Error authenticating and comparing passwords:', error);
        throw error;
    }
};


const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Check if username and password are provided
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required.' });
            }

            // Authenticate the user and compare the password
            const user = await authenticateAndCompare(username, password);
            if (!user) {
                // If user is not found or password is invalid, return 401
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            // If the credentials are valid, create a session for the user
            req.session.user = { id: user.id, username: user.username };
            res.status(200).json({ message: 'Login successful', user: req.session.user });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Other controller functions like logout, register, etc.
    logout: async (req, res) => {
        try {
            // Destroy the session to log the user out
            req.session.destroy();
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    register: async (req, res) => {
        try {
            if (!req.body) {
                return res.status(400).json({ error: 'Request body is missing.' });
            }
    
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email, and password are required.' });
            }
    
            // Check if the email already exists
            const existingEmailUser = await User.findOne({ where: { email } });
            if (existingEmailUser) {
                return res.status(400).json({ error: 'An account with this email already exists.' });
            }
    
            // Check if the username already exists
            const existingUsernameUser = await User.findOne({ where: { username } });
            if (existingUsernameUser) {
                return res.status(400).json({ error: 'An account with this username already exists.' });
            }
    
            if (password.length < 6) {
                return res.status(400).json("Password must be longer than 6 characters");
            }
            const hashedPassword = await bcrypt.hash(password, 10); // Using bcrypt to hash the password
    
            // Register the new user
            const newUser = await User.create({ username, email, password: hashedPassword });
            console.log('User created:', newUser);
    
            res.redirect('/Logare.html');
        } catch (error) {
            console.error('Error registering user:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = { authController, authenticateAndCompare };


