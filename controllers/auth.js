const express = require("express");
const authController = require("../controllers/auth.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");


// Define the register function
exports.register = async (req, res) => {
    console.log(req.body);
    const { name, email, password, passwordConfirm } = req.body;

    try {
        // Check if email already exists in the database
        const emailCheck = await db.query('SELECT email FROM users WHERE email = $1', [email]);
        
        // If email already exists, return an error message
        if (emailCheck.rows.length > 0) {
            return res.sendFile(__dirname + "/request.html", {
                message: 'The email is already in use'
            });
        } 
        
        // Check if password and passwordConfirm match
        if (password !== passwordConfirm) {
            return res.sendFile(__dirname + "/request.html", {
                message: 'Passwords do not match'
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        // Insert user into the database
        await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);

        // Redirect to a success page
        return res.sendFile(__dirname + "/request.html", {
            message: 'User registered'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

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
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!user.rows.length || !(await bcrypt.compare(password, user.rows[0].password))) {
            // If user doesn't exist or passwords don't match, return an error message
            return res.status(401).sendFile(__dirname + '/login.html', {
                message: 'Email or Password is incorrect'
            });
        } else {
            // If user is authenticated, generate a JWT token
            const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
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

// Define the logout function
exports.logout = (req, res) => {
    // Clear the userSave cookie to log out the user
    res.cookie('userSave', 'logout', {
        httpOnly: true,
        expires: new Date(0)
    });
    // Redirect the user to the homepage or any other desired location
    res.status(200).redirect("/");
};


const router = express.Router();

router.post('/Inregistrare.html', authController.register);
router.post('/Logare.html', authController.login);
router.get('/logout', authController.logout);

module.exports = router;