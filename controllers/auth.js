const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
// Assuming you have a User model
const { User } = require("../models/users.js"); 

// Define the login function
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).sendFile(__dirname + "/login.html", {
                message: "Please Provide an email and password"
            });
        }
        // Query the database to fetch user by email
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // If user doesn't exist or passwords don't match, return an error message
            return res.status(401).sendFile(__dirname + '/login.html', {
                message: 'Email or Password is incorrect'
            });
        } else {
            // If user is authenticated, generate a JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });
            console.log("the token is " + token);

            // Set cookie options
            const cookieOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                httpOnly: true
            };

            // Set the JWT token as a cookie
            res.cookie('userSave', token, cookieOptions);
            // Redirect to homepage or any other page after successful login
            res.status(200).redirect("/");
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};


const logout = (req, res) =>{
    res.cookie('userSave', 'logout', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.statuts(200).redirect('/');
}
module.exports = {router, logout};
