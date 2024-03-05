const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
const login = require('./login');
const { isAuthenticated } = require('./auth');

// Define the register route
router.post('/register', authController.register);

// Define the login route
router.post('/login', async (req, res) => {
    try {
        const loggedIn = await login(req);
        if (loggedIn) {
            res.sendFile(path.join(__dirname, './public/Logare.html'));
        }else{
            res.status(401).json({ message: "Unauthorized" });
        }
    }catch(error) {
        console.error('Error handling login: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Defining the login route:
router.get('/logged_in', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, './public/logged_in.html'));
});

// Define the logout route
router.get('/logout', authController.logout);

module.exports = router;
