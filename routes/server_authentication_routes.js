const express = require('express');
const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the router to be used in the main server file
module.exports = router;
