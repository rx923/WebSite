// Authentication page which is handling the user login routes.
// imported modules constants are set to be using different exported modules and handle user related authentication. 

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sessionUtils = require('./sessionUtils');
const { Op } = require('sequelize');
const validator = require('validator');
const { User, Session } = require('../models/userModel');
const { addPasswordHashHook} = require('../models/userHooks');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { authenticateAndGenerateToken } = require('../routes/user_authentication_routes');
const { json } = require('body-parser');
const saltRounds = 10;


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
//Hashing password during login for comparing both the stored database password and the plaintext password with the requried hash
const hashPasswordDuringLogin = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Use a cost factor of 10
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};


function generateSessionId(username) {
    const sessionId = `${username}-${uuidv4()}`;
    console.log('Session ID generated:', sessionId);
    return sessionId;
};

async function generateToken(sessionId, userId, expire) {
    try {
        // Generate a unique hash for signing the token using bcrypt
        const saltRounds = 10;
        const secretKey = (await bcrypt.hash(`${userId}${sessionId}`, saltRounds)).toString();

        // Use the generated hash as the secret key
        const payload = { userId };
        const token = jwt.sign(payload, secretKey, { expiresIn: '30m' });

        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
};

async function storeTokenInDatabase(sessionId, userId, expire, token) {
    try {
        // Ensure userId is a valid integer
        userId = parseInt(userId); 
        if (isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

        const session = await Session.create({
            sid: sessionId, 
            token: token, 
            expire: expire, 
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: userId // Foreign key association
        });

        console.log('Token stored in the database:', session);
        return session;
    } catch (error) {
        console.error('Error storing token in database:', error);
        return null;
    }
};

const authenticateAndCompare = async (username, providedPassword) => {
    try {
        // Retrieve user from the database based on the provided username
        const user = await User.findOne({ where: { username } });

        // If user is not found, return error
        if (!user) {
            console.log('User not found:', username);
            return { success: false, message: 'User not found', statusCode: 404 };
        };

        // Retrieve hashed password from the user object
        const storedHashedPassword = user.password;
        console.log(storedHashedPassword);

        // Hash the provided password for comparison
        const hashedProvidedPassword = await hashPasswordDuringLogin(providedPassword);
        console.log(hashedProvidedPassword);
        // Compare the hashed provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(hashedProvidedPassword, storedHashedPassword);
        console.log(isPasswordValid);

        // If passwords don't match, return error
        if (!isPasswordValid) {
            console.log('Invalid password for user:', username);
            return { success: false, message: 'Invalid password', statusCode: 401 };
        };

        // User authenticated successfully
        console.log('User authenticated successfully:', username);

        // Return success with the authenticated user object
        return { success: true, user };

    } catch (error) {
        console.error('Error authenticating user:', error);
        // Return internal server error
        return { success: false, message: 'Internal server error', statusCode: 500 };
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

async function updateUserProfile(req, res) {
    try {
        // Implementation for updating user profile
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

async function mapSessionToUser(sessionId, userId) {
    try {
        // Implementation for mapping session to user
    } catch (error) {
        console.error('Error mapping session to user:', error);
        throw error;
    }
};


const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
    
            // Authenticate user and compare passwords
            const authResult = await authenticateAndCompare(username, password);
    
            // Handle authentication result as needed
            if (authResult.success) {
                const user = authResult.user;
                // Generate a JWT token
                const token = await generateToken(req.sessionID, user.id, new Date(Date.now() + 30 * 60 * 1000)); // Set expiration to 30 minutes
                // Store the token in the database
                await storeTokenInDatabase(req.sessionID, user.id, new Date(Date.now() + 30 * 60 * 1000), token);
    
                // Store user session
                req.session.user = user;
    
                // Redirect the user to the logged-in page
                return res.redirect('/logged_in.html');
            } else {
                // Authentication failed
                console.log('Authentication failed for user:', username);
                return res.status(authResult.statusCode).render('login', { error: authResult.message });
            }
    
        } catch (error) {
            console.error('Error logging in:', error);
            return res.status(500).render('login', { error: 'Internal server error' });
        }
    },
    
    
    logout: async (req, res) => {
        try {
            if (!req.session || !req.session.user_id) {
                console.error('User session not found.');
                return res.status(400).json({ error: 'User session not found.' });
            }

            const loginTime = new Date(req.session.loginTime);
            const logoutTime = new Date();
            const sessionDuration = sessionUtils.getSessionDuration(loginTime, logoutTime);

            console.log(`Session ended for user ${req.session.user_id}`);

            const user = await User.findByPk(req.session.user_id);

            if (!user) {
                console.error('User not found.');
                return res.status(400).json({ error: 'User not found.' });
            }

            console.log('Session duration:', sessionUtils.formatSessionDuration(sessionDuration));
            console.log('Session ended');

            delete req.session.user_id;
            req.session.destroy();

            console.log('User logged out successfully.');
            res.redirect('/index.html');
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
    
            const hashedPassword = await hashPassword(password);
    
            // Save username, email, and hashed password to session
            req.session.registrationData = { username, email, password: hashedPassword };
    
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

module.exports = { authController, registerUser, hashPassword, updateUserProfile, mapSessionToUser, authenticateAndGenerateToken };