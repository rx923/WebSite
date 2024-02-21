const express = require('express');
const router = express.Router();


// importing the necessary modules/models
// const User = require('../models/User');


//Defining routes for user-related functionality
router.post('/register', async(req, res) =>{
    // To be written;
});

router.post('/login', async (req, res) => {
    // To be written;
});

//Some other user routes:
module.exports = router;



// Defining routes for the authentication functionality:
router.post('/login', async (req, res) => {
    // To be written;
});

// Defining route for logout functionality:
router.post('/logout', async (req, res) =>{
    // To be written;
});


// Other authentication routes:
module.exports = router;