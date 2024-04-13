// Import necessary modules
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const User = require('../models/userModel.js');

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

// Use the configureProfilePictureStorage() function to define storage
const upload = multer({ storage: configureProfilePictureStorage() });

// POST route for uploading profile pictures
router.post('/profile-photos', upload.array('profilePictures', 12), async (req, res) => {
    try {
        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

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

// Function to handle profile picture upload during profile completion
router.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Assuming you have user authentication middleware and req.user contains the authenticated user's information
        const userId = req.user.id;

        // Update the user's profile to store the profile photo information
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save the profile picture information to the user's profile
        const profilePicture = await saveProfilePicture(req.file);
        user.profilePictureFileName = profilePicture.filename;
        user.profilePictureFilePath = profilePicture.filepath;
        user.profilePictureFileSize = profilePicture.filesize;
        user.profilePictureMimeType = profilePicture.mimetype;
        user.profilePictureUploadDate = profilePicture.uploadDate;
        await user.save();

        return res.status(200).json({
            message: 'Profile picture uploaded successfully',
            fileName: profilePicture.filename,
            filePath: profilePicture.filepath,
            fileSize: profilePicture.filesize,
            mimeType: profilePicture.mimetype,
            uploadDate: profilePicture.uploadDate
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to save profile picture to a file
async function saveProfilePicture(profilePicture) {
    try {
        // Save the profile picture to a file
        const profilePictureFilename = `profile_${Date.now()}_${profilePicture.originalname}`;
        const profilePictureFilePath = path.join(__dirname, '..', 'profile_pictures', profilePictureFilename);
        await profilePicture.mv(profilePictureFilePath);

        return {
            filename: profilePictureFilename,
            filepath: profilePictureFilePath,
            filesize: profilePicture.size,
            mimetype: profilePicture.mimetype,
            uploadDate: new Date()
        };
    } catch (error) {
        console.error('Error saving profile picture:', error);
        throw error;
    }
}

module.exports = router;
