const express = require('express');
const router = express.Router;

router.get("/", (req, res) =>{
    res.render('index');
})
router.get('/register', (req, res) => {
    res.sendFile('Inregistrare.html', { root: "./public/" });
})
router.get('/login', (req, res) => {
    res.render('Logare.html', { root: "./public" });
})

module.exports = router;