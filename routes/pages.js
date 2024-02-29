const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();

// Define the register route
router.post('/register', authController.register);

// Define the login route
router.post('/login', authController.login);

// Define the logout route
router.get('/logout', authController.logout);

module.exports = router;
