const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/userModel.js');
const sessionUtils = require('./sessionUtils');
const { Op } = require('sequelize');
const validator = require('validator');
const { sequelize, Session } = require('../models/sessionModel');
//const { mapSessionToUser } = require('./sessionUtils');
// Adjusted import
const { v4: uuidv4 } = require('uuid');
const { mapSessionToUser, updateUserProfile, authenticateAndGenerateToken, updateSessionuser_id } = require('../routes/user_authentication_routes');


async function hashPassword(plaintextPassword) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plaintextPassword, salt);
        console.log('Password hashed successfully');
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



// Ensure userId is a valid integer before storing it
async function storeTokenInDatabase(sid, userId, token, expire) {
    try {
        userId = parseInt(userId); // Ensure userId is a valid integer
        if (isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

        const session = await Session.create({
            sid: sid,
            user_id: userId,
            sess: sid,
            token: token, // Store the token in the database
            expire: expire, 
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('Token stored in the database:', session);
        return session;
    } catch (error) {
        console.error('Error storing token in database:', error);
        return null;
    }
};

async function registerUser(req, res, username, email, password, userDetails) {
    try {
        console.log('User details received in registerUser:', userDetails);

        const existingEmailUser = await User.findOne({ where: { email: email } });
        const existingUsernameUser = await User.findOne({ where: { username: username } });

        if (existingEmailUser || existingUsernameUser) {
            throw new Error('Account with this email address or username already exists.');
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
            first_name: userDetails.first_name || null,
            last_name: userDetails.last_name || null,
            phone_number: userDetails.phone_number || null,
            address: userDetails.address || null,
            country_of_residence: userDetails.country_of_residence || null,
            full_name: userDetails.full_name || null,
            location: userDetails.location || null,
            contact_details: userDetails.contact_details
        });

        console.log('User created:', newUser);

        return newUser;
    } catch (error) {
        console.error('Error registering user:', error.message);
        throw error;
    }
};


async function authenticateAndCompare(req, providedUsername, providedPassword) {
    try {
        // Authenticate user
        const user = await User.findOne({ where: { username: providedUsername } });

        if (!user) {
            return { error: 'Invalid username or password.' };
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(providedPassword, user.password);

        if (!isPasswordValid) {
            return { error: 'Invalid username or password.' };
        }

        return { user }; // Return the user if authentication and password comparison are successful
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
};


const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
    
            if (!username || !password) {
                console.log('Missing username or password in request:', req.body);
                return res.status(400).json({ error: 'Username and password are required.' });
            }
    
            console.log('Attempting to login with username:', username);
    
            // Authenticate user and generate token
            const authResult = await authenticateAndGenerateToken(req, username, password);
            console.log('Authentication result:', authResult);
            
            if (authResult.error) {
                console.error('Authentication error:', authResult.error);
                return res.status(401).json({ error: authResult.error });
            }
    
            const { token, user } = authResult;
            req.session.loginTime = new Date();
    
            // Set user_id in the session after successful login
            req.session.user_id = user.id;
            // Associate the user ID with the session ID in the session table
            await mapSessionToUser(req.session.id, user.id);
    
            console.log('User logged in successfully:', user.username);
    
            // Redirect to logged_in.html upon successful login
            return res.redirect('/logged_in.html');
        } catch (error) {
            console.error('Error logging in:', error);
            return res.status(500).json({ error: 'Internal server error' });
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
            res.status(500).json({ message: 'Internal server error' });
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

            req.session.registrationData = { username, email, password: hashedPassword };

            console.log('Registration data saved to session:', req.session.registrationData);

            res.redirect('/Inregistrare_User_Completare_Profil.html');

        } catch (error) {
            console.error('Error registering user:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    profileCompletion: async (req, res) => {
        try {
            const { first_name, last_name, full_name, location, phone_number, contact_details, address } = req.body;

            const sanitizedFirstName = validator.escape(first_name);
            const sanitizedLastName = validator.escape(last_name);
            const sanitizedFullName = validator.escape(full_name);
            const sanitizedLocation = validator.escape(location);
            const sanitizedPhoneNumber = validator.escape(phone_number);
            const sanitizedContactDetails = validator.escape(contact_details);
            const sanitizedAddress = validator.escape(address);

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

            if (!req.session.registrationData) {
                return res.status(400).json({ error: 'Registration data not found in session' });
            }

            const { username, email, password } = req.session.registrationData;

            console.log('Registration data:', { username, email, password });

            const newUser = await registerUser(req, res, username, email, password, userDetails);

            console.log('User registered successfully:', newUser);

            return res.status(200).json({ message: 'Profile completed successfully' });

        } catch (error) {
            console.error('Error submitting profile:', error);
            return res.status(500).json({ message: 'Error submitting profile' });
        }
    }
};


module.exports = { authController, registerUser, hashPassword, updateUserProfile, mapSessionToUser, authenticateAndGenerateToken };