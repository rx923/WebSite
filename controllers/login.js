const bcrypt = require('bcryptjs');
const User = require('../models/userModel.js');

//Defining the login function

// login function
const login = async (req) => {
    try {
        const { uname, password } = req.body;
        if (!uname || !password) {
            return false;
        }
        // Find the user in the database by username
        const user = await User.findOne({ where: { username: uname } });
        if (!user) {
            return false; // User not found
        }
        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return false; // Password incorrect
        }
        // If username and password match, return true for successful login
        return true;
    } catch (err) {
        console.error('Error during login:', err);
        return false;
    }
};


module.exports = login;