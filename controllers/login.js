const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

//Defining the login function

// login function
async function login(req) {
    try {
        const { username, password } = req.body;

        // Checking if both username and password are provided
        if (!username || !password) {
            // Returning false if either username or password is missing or not matching
            return false;
        }

        const user = await User.findOne({ where: { username } });

        // If user doesn't exist, return false
        if (!user) {
            return false;
        }

        // Compare passwords from the input to the stored database information
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // If password matches, return true
        return isPasswordValid;
    } catch (err) {
        console.error('Error during login:', err);
        return false;
    }
}


module.exports = login;