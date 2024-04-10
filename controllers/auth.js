const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sessionUtils = require('./sessionUtils');
const { Op } = require('sequelize');
const validator = require('validator');
const { User, Session } = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { authenticateAndGenerateToken } = require('../routes/user_authentication_routes');

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
            user_id: userId,
            token: token, 
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



async function authenticateAndCompare(providedUsername, providedPassword) {
    try {
        const user = await User.findOne({ where: { username: providedUsername } });

        if (!user) {
            return { error: 'Invalid username' };
        }

        const isPasswordValid = await bcrypt.compare(providedPassword, user.password);

        if (!isPasswordValid) {
            return { error: 'Invalid password' };
        }

        return { user }; 
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
};

async function registerUser(req, res, username, email, hashedPassword, userDetails) {
    try {
        console.log('User details received in registerUser:', userDetails);

        const existingEmailUser = await User.findOne({ where: { email: email } });
        const existingUsernameUser = await User.findOne({ where: { username: username } });

        if (existingEmailUser || existingUsernameUser) {
            throw new Error('Account with this email address or username already exists.');
        }

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
            contact_details: userDetails.contact_details || null
        });

        console.log('User created:', newUser);

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
    
            if (!username || !password) {
                console.log('Missing username or password in request:', req.body);
                // Render the login page with an error message
                return res.status(404).render('wrong_username_password', { pageTitle: 'Wrong Username or Password' });
            }
    
            console.log('Attempting to login with username:', username);
    
            // Authenticate user and compare password
            const authResult = await authenticateAndCompare(username, password); // Remove req, res here
    
            if (authResult.error) {
                console.error('Authentication error:', authResult.error);
                // Render the wrong username or password page
                return res.status(401).sendFile(path.join(__dirname, '../public/wrong_password&username.html'));
            }
    
            const { user } = authResult;
    
            // Generate a session ID
            const sessionId = generateSessionId(username);
    
            // Generate token
            const token = await generateToken(sessionId, user.id);
    
            console.log('Token generated:', token);
    
            // Set expiration time
            // 30 minutes expiration
            const expire = new Date(Date.now() + (30 * 60 * 1000)); 
    
            // Store token in database with expiration time
            const storedToken = await storeTokenInDatabase(sessionId, user.id, expire, token);
    
            if (!storedToken) {
                console.error('Failed to store token in database');
                // Return 500 status code and a message to the user
                return res.status(500).send('Failed to store token in database');
            }
    
            // Log the session of the user
            const loginTime = new Date();
            console.log(`Session started for user ${user.username} at ${loginTime}`);
    
            // Set session variables
            req.session.loginTime = loginTime;
            req.session.user_id = user.id;
            await mapSessionToUser(req.session.id, user.id);
    
            console.log('User logged in successfully:', user.username);
            // Redirect to logged in page
            return res.redirect('/logged_in.html');
        } catch (error) {
            console.error('Error logging in:', error);
            // Render the login page with an error message
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
