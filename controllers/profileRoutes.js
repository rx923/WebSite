const express = require('express');
const multer = require('multer');
const path = require('path');
const { authController } = require('../controllers/auth');

const router = express.Router();


//Multer configuration for handling file uploads

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

//POST route for uplpoading profile picture

router.post('/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const filePath = req.file.path;
        res.status(200).json({ message: 'Profile picture uploaded successfully', filePath: filePath });

    } catch(error) {
        console.error('Error uploading profile picture: ', error);
        res.status(500).json({ message: 'Error uploading profile picture' });
    }
});
module.exports = router;
