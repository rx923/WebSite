// profileRoutes.js

// Import necessary modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const User = require('../models/userModel.js');
const filePath = 'U:/Plan_Afacere/WebSite/uploads/profile-pictures/1711886313658-281979936.jpg';


function file_searching(filePath, fileName) {
    return new Promise((resolve, reject) => {
        fs.readdir(filePath, (err, files) => {
            if (err) {
                // Error reading directory
                reject(err); 
                return;
            }

            // Check if the fileName exists in the directory
            if (files.includes(fileName)) {
                // File found
                resolve(true); 
            } else {
                // File not found
                resolve(false); 
            }
        });
    });
}

// Function to define storage for profile pictures
function configureProfilePictureStorage() {
    return multer.diskStorage({
        destination: function (req, file, cb) {
             // Destination folder where profile pictures will be stored temporarily
            cb(null, 'uploads/profile-pictures');
        },
        filename: function (req, file, cb) {
            // Generating a unique filename for the uploaded profile picture
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Appending file extension
            cb(null, uniqueSuffix + path.extname(file.originalname)); 
        }
    });
}

// Multer Instance with storage configuration
// Use the configureProfilePictureStorage() function to define storage
const upload = multer({ storage: configureProfilePictureStorage() }); 

// POST route for uploading profile picture
// POST route for uploading profile pictures
router.post('/profile-photos', upload.array('profilePictures', 12), async (req, res) => {
    try {
        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        console.log('profilePictures');

        // Assuming you have user authentication middleware and req.user contains the authenticated user's information
        const userId = req.user.id;
        

        // Update the user's profile to store the profile photo information
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save the file information to the user's profile
        const profilePictures = req.files.map(file => file.filename);
        user.profilePictures.push(...profilePictures);
        await user.save();

        res.status(200).json({ message: 'Profile pictures uploaded successfully', filenames: profilePictures });
    } catch(error) {
        console.error('Error uploading profile pictures:', error);
        res.status(500).json({ message: 'Error uploading profile pictures' });
    }
});


module.exports = router;
