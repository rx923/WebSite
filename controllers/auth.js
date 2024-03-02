const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
// Assuming you have a User model
const { User } = require("../models/users.js"); 



router.post('/login', async (req, res) => {
    try {
        // Call the loginUser function passing the request body
        const result = await loginUser(req.body);
        res.json(result);
    } catch (error) {
        console.error('Error handling login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Define the login function
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).send("Please provide both username and password.");
        }

        // Query the database to find the user by username
        const user = await User.findOne({ where: { username } });

        // If user doesn't exist, return error
        if (!user) {
            return res.status(401).send("User not found.");
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // If passwords match, generate JWT token and set as cookie
        if (isPasswordValid) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });
            console.log("the token is " + token);

            // Set cookie options
            const cookieOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly: true
            };

            res.cookie("jwt", token, cookieOptions);
            res.status(200).redirect("/dashboard");
        } else {
            // If passwords don't match, return error
            return res.status(401).send("Invalid password.");
        }
    } catch (err) {
        console.error("Error during login:", err);
        return res.status(500).send("Internal Server Error");
    }
};


const logout = (req, res) =>{
    res.cookie('userSave', 'logout', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.statuts(200).redirect('/');
}
module.exports = { router, logout };
