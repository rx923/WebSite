// Authentication page which is handling the user login routes.
// imported modules constants are set to be using different exported modules and handle user related authentication. 

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const sessionUtils = require('./sessionUtils');
const { Op } = require('sequelize');
const validator = require('validator');
const { User, Session } = require('../models/userModel');
const { addPasswordHashHook} = require('../models/userHooks');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { router, updateUserProfile, mapSessionToUser, authenticateAndGenerateToken, updateSessionuser_id, generateAuthToken, storeTokenInDatabase } = require('../routes/user_authentication_routes');
const { json } = require('body-parser');
const handleLogin = require('../controllers/handleLogin');
const { handleLogout, clearSessionFromDatabase } = require('./logout');



//Hashing password during user registration
async function hashPassword(plaintextPassword) {
    try {
        // Generate a salt with 10 rounds
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);

        // Hash the plaintext password using the generated salt
        const hashedPassword = await bcrypt.hash(plaintextPassword, salt);

        // Log the hashed password for debugging (optional)
        console.log('Password hashed successfully:', hashedPassword);

        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

async function saveProfilePicture(profilePicture, userId) {
    try {
        if (!profilePicture) {
            throw new Error('No profile picture provided');
        }

        // Construct a unique filename for the profile picture
        const profilePictureFilename = `profile_${userId}_${Date.now()}_${profilePicture.name}`;
        console.log('Profile Picture Filename:', profilePictureFilename); // Log the filename
        
        const profilePictureFilePath = path.join(__dirname, '..', 'profile_pictures', profilePictureFilename);
        console.log('Profile Picture Filepath:', profilePictureFilePath); // Log the filepath

        // Save the profile picture to a file
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
};

async function registerUser(req, res, username, email, hashedPassword, userDetails, profilePicture) {
    try {
        console.log('User details received in registerUser:', userDetails);

        const existingEmailUser = await User.findOne({ where: { email: email } });
        const existingUsernameUser = await User.findOne({ where: { username: username } });

        if (existingEmailUser || existingUsernameUser) {
            throw new Error('Account with this email address or username already exists.');
        }

        let profilePictureInfo = null;

        if (profilePicture) {
            profilePictureInfo = await saveProfilePicture(profilePicture);
        }

        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword, // Use the hashed password passed as an argument
            first_name: userDetails.first_name || null,
            last_name: userDetails.last_name || null,
            phone_number: userDetails.phone_number || null,
            address: userDetails.address || null,
            country_of_residence: userDetails.country_of_residence || null,
            full_name: userDetails.full_name || null,
            location: userDetails.location || null,
            contact_details: userDetails.contact_details || null,
            profilepicturefilename: profilePictureInfo ? profilePictureInfo.filename : null,
            profilepicturefilepath: profilePictureInfo ? profilePictureInfo.filepath : null,
            profilepicturefilesize: profilePictureInfo ? profilePictureInfo.filesize : null,
            profilepicturemimetype: profilePictureInfo ? profilePictureInfo.mimetype : null,
            profilepictureuploaddate: profilePictureInfo ? profilePictureInfo.uploadDate : null
        });

        console.log('User created:', newUser);

        // Save username, email, and hashed password to session
        req.session.registrationData = { username, email, password: hashedPassword };

        return newUser;
    } catch (error) {
        console.error('Error registering user:', error.message);
        throw error;
    }
};

async function fetchUserData(id) {
    try {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        const userInfo = {
            username: user.username,
            email: user.email,
            location: user.location,
        };

        return userInfo;
    } catch (error) {
        console.error('Error fetching user information:', error);
        throw error;
    }
};

const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
    
            // Check if the user exists in the database
            const user = await User.findOne({ where: { username: username } });
            if (!user) {
                // User does not exist
                return res.status(401).render('incorrect_password', { error: 'Invalid username or password.' });
            }
    
            // Authenticate user and retrieve user object
            const result = await authenticateAndGenerateToken(req, username, password);
    
            // Handle authentication result
            if (result.error) {
                console.error('Error authenticating user:', result.error);
    
                // Render the appropriate view based on the error
                if (result.error === 'Invalid username or password.') {
                    return res.status(401).render('incorrect_password', { error: 'Invalid username or password.' });
                } else {
                    // Handle other potential errors
                    return res.status(500).render('error', { message: 'Internal server error. Please try again later.' });
                }
            } else {
                req.session.user = {
                    id: result.user.id,
                    username: result.user.username,
                    // Add other user information as needed
                };
                // Generate auth token
                const token = await generateAuthToken(req, result.user, Date.now());
                // Set expiration time (1 hour expiration)
                const expire = new Date(Date.now() + 3600000);
                // Generate session ID
                const sessionId = req.sessionID;
                console.log(sessionId);
                console.log(req.sessionID);
                // Map session to user
                await mapSessionToUser(sessionId, result.user.id);
                // Update session with user ID and expiration time
                await updateSessionuser_id(sessionId, result.user.id, expire);
                // Store token in database with expiration time
                await storeTokenInDatabase(req.sessionID, result.user.id, token, expire);
                // Redirect the user to the logged-in page
                return res.redirect('/logged_in.html');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            // Handle different types of errors here if needed
            return res.status(500).json({ error: 'An unexpected error occurred during login.' });
        }
    },
    
    
    logout: async (req, res) => {
        try {
            // Check if the user session exists and is active
            if (req.sessionID) {
                // Destroy session
                req.session.destroy();
                console.log('User logged out successfully.');
                
                // Set logout message
                const logoutMessage = "You have successfully logged out. Thank you!";
                
                // Redirect to main page with logout message
                return res.redirect('/index.html?logoutMessage=' + encodeURIComponent(logoutMessage));
            } else {
                console.error('User session not found or inactive.');
                return res.status(400).json({ error: 'User session not found or inactive.' });
            }
        } catch (error) {
            console.error('Error logging out:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    
    register: async (req, res) => {
        try {
            if (!req.body) {
                return res.status(400).json({ error: 'Request body is missing.' });
            }
    
            const { username, email, password } = req.body;
    
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email, and password are required.' });
            }
    
            if (password.length < 6 || password.length > 20) {
                return res.status(400).json({ error: 'Password must be between 6 and 20 characters.' });
            }
            // Save username, email, and hashed password to session
            req.session.registrationData = { username, email, password };


            console.log('Registration data saved to session:', req.session.registrationData);
    
            res.redirect('/Inregistrare_User_Completare_Profil.html');
        } catch (error) {
            console.error('Error registering user:', error.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    profileCompletion: async (req, res) => {
        try {
            const { first_name, last_name, full_name, location, phone_number, contact_details, address } = req.body;
    
            // Sanitize input
            const sanitizedFirstName = validator.escape(first_name);
            const sanitizedLastName = validator.escape(last_name);
            const sanitizedFullName = validator.escape(full_name);
            const sanitizedLocation = validator.escape(location);
            const sanitizedPhoneNumber = validator.escape(phone_number);
            const sanitizedContactDetails = validator.escape(contact_details);
            const sanitizedAddress = validator.escape(address);
    
            // Check for empty fields
            if (
                sanitizedFirstName.trim() === '' ||
                sanitizedLastName.trim() === '' ||
                sanitizedFullName.trim() === '' ||
                sanitizedLocation.trim() === '' ||
                sanitizedPhoneNumber.trim() === '' ||
                sanitizedContactDetails.trim() === '' ||
                sanitizedAddress.trim() === ''
            ) {
                return res.status(400).json({ error: 'One or more required fields are empty' });
            }
    
            const userDetails = {
                first_name: sanitizedFirstName,
                last_name: sanitizedLastName,
                full_name: sanitizedFullName,
                location: sanitizedLocation,
                phone_number: sanitizedPhoneNumber,
                contact_details: sanitizedContactDetails,
                address: sanitizedAddress,
                country_of_residence: 'Unknown'
            };
    
            console.log('User details:', userDetails);
    
            // Retrieve registration data from session
            if (!req.session.registrationData) {
                return res.status(400).json({ error: 'Registration data not found in session' });
            }
    
            const { username, email, password } = req.session.registrationData;
    
            console.log('Registration data:', { username, email, password });
    
            // Register user with complete profile
            const newUser = await registerUser(req, res, username, email, password, userDetails);
            const hashedPassword = await hashPassword(password);
            console.log('User registered successfully:', newUser);
    
            // Destroy session after profile completion
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ error: 'Error destroying session' });
                }
                console.log('Session destroyed after profile completion');
            });

            return res.status(200).json({ message: 'Profile completed successfully' });

        } catch (error) {
            console.error('Error submitting profile:', error);
            return res.status(500).json({ message: 'Error submitting profile' });
        }
    }
};

module.exports = { authController, registerUser, hashPassword, updateUserProfile, mapSessionToUser };