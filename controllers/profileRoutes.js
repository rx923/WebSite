// profileRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Specify the destination directory for uploads
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function(req, file, cb) {
        // Generate a unique filename using the original filename and a timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Use the original filename and add a unique suffix
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// POST route for uploading profile picture
router.post('/profile-photo', upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const filePath = req.file.path;
        const fileName = req.file.filename;
        const fileSize = req.file.size;
        const mimeType = req.file.mimetype;
        // Assuming you have user authentication middleware
        const user_id = req.user.id; 

        console.log('filePath: ', filePath);
        console.log('fileName: ', fileName);
        console.log('fileSize: ', fileSize);
        console.log('mimeType: ', mimeType);
        console.log('userId: ', user_id);

        // Here you can insert the file details into your database or perform other operations

        res.status(200).json({ message: 'Profile picture uploaded successfully', filePath: filePath });
    } catch(error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Error uploading profile picture' });
    }
});

module.exports = router;
