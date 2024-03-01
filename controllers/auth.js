const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const usersController = require("../controllers/userController.js");
const app = require('../server');


const { promisify } = require("util");
// app.use(express.json());

// Define a function that takes app as a parameter
module.exports = function(app) {
    // Middleware
    app.use(express.json());

    // Define the register function
    // Define the register function
    exports.register = async (req, res) => {
        // Extract data from the request body
        const { name, email, password } = req.body;

        try {
            // Check if the email already exists in the database
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                // If the email already exists, return an error response
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user in the database
            const newUser = await User.create({ name, email, password: hashedPassword });

            // Return a success response
            return res.status(201).json({ message: 'User registered successfully', user: newUser });
        } catch (error) {
            // If an error occurs, log the error and return an error response
            console.error('Error registering user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    // Define the register function
    // Define the register function
    exports.register = async (req, res) => {
        // Extract data from the request body
        const { name, email, password } = req.body;

        try {
            // Check if the email already exists in the database
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                // If the email already exists, return an error response
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user in the database
            const newUser = await User.create({ name, email, password: hashedPassword });

            // Return a success response
            return res.status(201).json({ message: 'User registered successfully', user: newUser });
        } catch (error) {
            // If an error occurs, log the error and return an error response
            console.error('Error registering user:', error);
            return res.status(500).json({ message: 'Internal server error' });
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
    router.post('/register', usersController.register);
    router.post('/login', usersController.login);
    router.post('/logout', usersController.logout);

    return router;
};




// app.post('./register', authController.register);

// router.post('/public/Logare.html', authController.login);
// router.get('/logout', authController.logout);

module.exports = router;