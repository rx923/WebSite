const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/userModel.js');
const sessionUtils = require('./sessionUtils');
const { Op } = require('sequelize');
const validator = require('validator');
const { sequelize, Session } = require('../models/sessionModel');
const { mapSessionToUser } = require('./sessionUtils');
// Adjusted import


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

async function comparePasswords(plaintextPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plaintextPassword, hashedPassword);
        console.log('Password comparison result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
};

function generateSessionId() {
    const sessionId = Math.random().toString(36).substr(2, 10);
    console.log('Session ID generated:', sessionId);
    return sessionId;
};

// Ensure userId is a valid integer before storing it
async function storeTokenInDatabase(sid, userId, token, expire) {
    try {
        // Ensure userId is a valid integer
        userId = parseInt(userId);
        if (isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

        // Create a new session record in the database
        const session = await Session.create({
            sid: sid,
            user_id: userId,
            sess: sid,
            // Store the token in the database
            token: token,
            // 1 hour expiration
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


async function authenticateAndGenerateToken(req, providedUsername, providedPassword) {
    try {
        // Authenticate user
        const user = await User.findOne({ where: { username: providedUsername } });
        console.log('User found:', user);
        if (!user) {
            return { error: 'Invalid username or password.' };
        }

        // Check password validity
        const isPasswordValid = await comparePasswords(providedPassword, user.password);
        console.log('Password validity:', isPasswordValid);
        if (!isPasswordValid) {
            return { error: 'Invalid username or password.' };
        }

        // Ensure req.session and req.session.id are defined
        if (!req.session || !req.session.id) {
            throw new Error('Session ID is missing.');
        }

        // Generate auth token
        const token = await generateAuthToken(req, user.id, Date.now());

        // Set expiration time
        const expire = new Date(Date.now() + 3600000); // 1 hour expiration

        // Store token in database with expiration time
        await storeTokenInDatabase(req.session.id, user.id, token, expire);

        return { token, user };
    } catch (error) {
        console.error('Error authenticating user and generating token:', error);
        throw error;
    }
};


async function generateAuthToken(req, userOrUserId, loginTimestamp) {
    try {
        let userId;
        if (typeof userOrUserId === 'object') {
            userId = userOrUserId.id;
        } else {
            userId = userOrUserId;
        }

        // Ensure userId is a valid integer
        userId = parseInt(userId);
        if (isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

        // Generate the JWT token
        const payload = {
            id: userId,
            loginTimestamp: loginTimestamp
        };
        const token = jwt.sign(payload, 'secret_key', { expiresIn: '1h' });
        console.log(token);

        return token;
    } catch (error) {
        console.error('Error generating auth token:', error);
        throw error;
    }
};


async function updateSessionuser_id(sessionId, user_id, expire) {
    try {
        const foundSession = await Session.findOne({ where: { sid: sessionId } });

        if (!foundSession) {
            throw new Error('Session not found.');
        }

        await foundSession.update({ user_id, expire });

        console.log('Session user ID updated successfully');
    } catch (error) {
        console.error('Error updating session user ID:', error.message);
        return null;
    }
};

async function registerUser(req, username, email, password, userDetails) {
    try {
        const existingEmailUser = await User.findOne({ where: { email } });
        const existingUsernameUser = await User.findOne({ where: { username } });

        if (existingEmailUser || existingUsernameUser) {
            throw new Error('An account with this email or username already exists.');
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

        await updateSessionuser_id(req.session.id, newUser.id);

        console.log('User created:', newUser);

        return newUser;
    } catch (error) {
        console.error('Error registering user:', error.message);
        throw error;
    }
};

async function authenticateAndCompare(req, providedUsername, providedPassword) {
    try {
        const user = await User.findByUsername(providedUsername);
        console.log(providedUsername);
        if (!user) {
            return { error: 'Invalid username or password.' };
        }

        const isPasswordValid = await comparePasswords(providedPassword, user.password);
        console.log(isPasswordValid);
        if (!isPasswordValid) {
            return { error: 'Invalid username or password.' };
        }

        const token = await generateAuthToken(req, user.id, Date.now());
        req.session.user_id = user.id;
        await mapSessionToUser(req, req.session.id, user.id);
        return { token, user };
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
};


async function updateUserProfile(userId, userDetails) {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found.');
        }

        await user.update({
            first_name: userDetails.first_name,
            last_name: userDetails.last_name,
            phone_number: userDetails.phone_number,
            address: userDetails.address,
            country_of_residence: userDetails.country_of_residence,
            full_name: userDetails.full_name,
            location: userDetails.location,
            contact_details: userDetails.contact_details,
        });

        console.log('User profile updated:', user);
        return user;
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        throw error;
    }
}


const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
    
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required.' });
            }
    
            // Authenticate user and generate token
            const authResult = await authenticateAndGenerateToken(req, username, password);
    
            if (authResult.error) {
                return res.status(401).json({ error: authResult.error });
            }
    
            const { token, user } = authResult;
    
            // Set user_id in the session after successful login
            req.session.user_id = user.id;
            // Associate the user ID with the session ID in the session table
            await mapSessionToUser(req.session.id, user.id);
    
            // Redirect to logged_in.html upon successful login
            return res.redirect('/logged_in.html');
        } catch (error) {
            console.error('Error logging in:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    logout: async (req, res) => {
        try {
            // Check if user session and user object exist
            if (!req.session || !req.session.user_id) {
                console.error('User session not found.');
                // Redirect to the appropriate page or send an error response
                return res.status(400).json({ error: 'User session not found.' });
            }
    
            // Retrieve login time from session
            const loginTime = new Date(req.session.loginTime);
    
            // Get current time as logout time
            const logoutTime = new Date();
    
            // Calculate session duration
            const sessionDuration = sessionUtils.getSessionDuration(loginTime, logoutTime);
    
            // Log session end and duration along with user identifier
            console.log(`Session ended for user ${req.session.user.username}`);
            console.log('Session duration:', sessionUtils.formatSessionDuration(sessionDuration));
            console.log('Session ended');
            delete req.session.user_id;
            // Destroy the session to log the user out
            req.session.destroy();
            console.log('User logged out successfully.');
            // Redirect to the appropriate page after logout
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

            // Save registration data to session
            req.session.registrationData = { username, email, password };

            res.redirect('/Inregistrare_User_Completare_Profil.html');

        } catch (error) {
            console.error('Error registering user:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    profileCompletion: async (req, res) => {
        try {
            // Request body
            const { first_name, last_name, full_name, location, phone_number, contact_details, address } = req.body;
    
            // Sanitize and escape input
            const sanitizedFirstName = validator.escape(first_name);
            const sanitizedLastName = validator.escape(last_name);
            const sanitizedFullName = validator.escape(full_name);
            const sanitizedLocation = validator.escape(location);
            const sanitizedPhoneNumber = validator.escape(phone_number);
            const sanitizedContactDetails = validator.escape(contact_details);
            const sanitizedAddress = validator.escape(address);
    
            // Check if any of the sanitized values are empty strings
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
    
            // Construct userDetails object
            const userDetails = {
                first_name: sanitizedFirstName,
                last_name: sanitizedLastName,
                full_name: sanitizedFullName,
                location: sanitizedLocation,
                phone_number: sanitizedPhoneNumber,
                contact_details: sanitizedContactDetails,
                address: sanitizedAddress,
                // If this value is always the same, you can set it here
                country_of_residence: 'Unknown' 
            };
    
            // Find the user in the database based on their username or email
            let user = await User.findOne({ 
                where: { 
                    [Op.or]: [
                        { username: req.session.registrationData.username }, 
                        { email: req.session.registrationData.email }
                    ] 
                } 
            });
    
            // If user doesn't exist, create a new user
            if (!user) {
                console.log('User not found, creating new user...');
                // Pass req object as the first argument to registerUser
                user = await registerUser(req, req.session.registrationData.username, req.session.registrationData.email, req.session.registrationData.password, userDetails);
                
                // Redirect user to success page
                return res.status(200).json({ message: 'Profile completed successfully' });
            } else {
                // User already exists
                console.log('User already exists');
                return res.status(400).json({ error: 'An account with this username or email already exists.' });
            }
    
        } catch (error) {
            console.error('Error submitting profile:', error);
            return res.status(500).json({ message: 'Error submitting profile' });
        }
    }
};


module.exports = { authController, registerUser, hashPassword, updateUserProfile, mapSessionToUser, authenticateAndGenerateToken };