// pages.js
const express = require('express');
const router = express.Router();
const path = require('path');
// Define routes using the router
const { authController, isAuthenticated } = require('../controllers/auth.js');
// router.post('/register', authController.register);

// router.post('/login', authController.login); 
router.get('/', (req, res) => {
    // Update file path
    res.sendFile(path.join(__dirname, '../public/index.html')); 
});
// router.get('/logout', authController.logout);

module.exports = router;
