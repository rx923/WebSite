// authController.js
const bcrypt = require('bcryptjs');
// Adjust the path accordingly
const { User } = require('../models/userModel.js');



const comparePasswords = async (providedPassword, hashedPassword) => {
    try {
        // Create the user
        const user = await createUser(username, email, password);
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
        // Use bcrypt to compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(providedPassword, hashedPassword);
        return isPasswordValid;
    } catch (error) {
        // Handle any errors that occur during the comparison process
        console.error('Error comparing passwords:', error);
        throw error; // Rethrow the error to be handled by the caller
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

const authenticateUser = async (username, password) => {
    try {
            const { username, password } = req.body;

        const isPasswordValid = await comparePasswords(password, user.password);
        return isPasswordValid ? user : false;
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
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
    
            // Authenticate the user
            const user = await authenticateUser(username, password);
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }
    
            // If the credentials are valid, create a session for the user
            req.session.user = { id: user.id, username: user.username };
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

