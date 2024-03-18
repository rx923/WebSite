// authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Adjust the path accordingly
const { User } = require('../models/userModel.js');
const { use } = require('../server.js');
const session = require('express-session');
const validator = require('validator');
const { Op } = require('sequelize');
const path = require('path');
const sessionUtils = require('./sessionUtils');

// hashing the passwords while creating an account for storing inside the database.
// no visibility of the password when the user creates the account.
const hashPassword = async (plaintextPassword) => {
    try {
        // Generate a salt to use for hashing
        const salt = await bcrypt.genSalt(10);
        // Hash the plaintext password with the generated salt
        const hashedPassword = await bcrypt.hash(plaintextPassword, salt);
        console.log(hashedPassword);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

const comparePasswords = async (plaintextPassword, hashedPassword) => {
    try {
        // Compare the plaintext password with the hashed password
        const isMatch = await bcrypt.compare(plaintextPassword, hashedPassword);
        console.log(isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
};

const generateAuthToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
    };
    const token = jwt.sign(payload, 'secret_key', {expiresIn: '1h'});
    console.log(token);
    return token;
}

const updateSessionUserId = async (req, userId) => {
    const userData = req.body;
    try {
        // Update the user_id field in the sessions table based on session ID
        // Assuming you have a function or query to update the session user ID
        // For example, using Sequelize ORM:
        await session.update({ user_id: userId }, { where: { sid: req.session.id } });
    } catch (error) {
        console.error('Error updating session user ID:', error.message);
        throw error;
    }
};


const registerUser = async (username, email, password, userDetails, req) => {
    try {
        // Check if the email already exists
        const existingEmailUser = await User.findOne({ where: { email } });
        if (existingEmailUser) {
            throw new Error('An account with this email already exists.');
        }

        // Check if the username already exists
        const existingUsernameUser = await User.findOne({ where: { username } });
        if (existingUsernameUser) {
            throw new Error('An account with this username already exists.');
        }

        // Hash the plaintext password before storing it in the database
        const hashedPassword = await hashPassword(password);

        // Register the new user with all the required details
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

        // After successfully creating the user, retrieve the ID of the newly created user
        const userId = newUser.id;

        // Update the user_id field in the sessions table for the current session
        await updateSessionUserId(req.session.id, userId);

        console.log('User created:', newUser);

        return newUser;
    } catch (error) {
        console.error('Error registering user:', error.message);
        throw error;
    }
};



const authenticateAndCompare = async (providedUsername, providedPassword, sessionId) => {
    try {
        // Retrieve the user from the database
        const user = await User.findByUsername(providedUsername);
        console.log(providedUsername);
        if (!user) {
            return { error: 'Invalid username or password.' };
        }

        // Compare the provided password with the password stored in the database
        const isPasswordValid = await comparePasswords(providedPassword, user.password);
        console.log(isPasswordValid);
        if (!isPasswordValid) {
            return { error: 'Invalid username or password.' };
        }

        // If the credentials are valid, generate a JWT token
        const token = generateAuthToken(user);

        // Associate the user ID with the session ID in the session table
        await mapSessionToUser(sessionId, user.id);

        // Return the user object along with the token
        return { token, user };
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
};

const mapSessionToUser = async(sessionId, userId) => {
    try{
        const Session = require('../models/sessionModel');

        const session = await Session.findByPk(sessionId);

        if (session) {
            await session.update({ userId: userId });
        } else {
            console.error('Session not found.');
            throw new Error('Session not found.');
        }
    } catch(error) {
        console.error('Error mapping session to user: ', error);
        throw error;
    }
};

const updateUserProfile = async(userId, profileData) => {
    try{

        const user = await User.findOne(userId);
        if(!user) {
            throw new Error('User not found');
        }
        await user.update(profileData);
        console.log('User profile updated successfully');
    }catch(error) {
        throw new Error(`Error updating user profile: ${error,message}`);
    }
};



const authController = {
    login: async (req, res) => {
        // Check if username and password are provided
        const { username, password } = req.body;
        console.log(`User ${username} logged in`);
        console.log('Password:', password);
        console.log('Session ID:', req.session.id);
        console.log('User ID:', req.session.userId);
        console.log('Session Cookie:', req.session.cookie);        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }
      
        try {
            req.session.loginTime = new Date();
            console.log(`User ${username} logged in`);
            // Authenticate the user and compare the password
            const authResult = await authenticateAndCompare(username, password);
            if (authResult.error) {
                console.log('Authentication result:', authResult);
                // If user is not found or password is invalid, return 401
                return res.status(401).json({ error: authResult.error });
            }
      
            // If the credentials are valid, proceed with successful login logic
            const { token, user } = authResult;
            console.log('Token:', token);
            console.log('User:', user);
            // Set user object in the session
            req.session.user = user;
            // Set userId in the session
            req.session.userId = user.id; 

            // Redirect to the appropriate page after successful login
            res.redirect('/logged_in.html');
          
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    logout: async (req, res) => {
        try {
            // Check if user session and user object exist
            if (!req.session || !req.session.user) {
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
            delete req.session.userId;
            // Destroy the session to log the user out
            req.session.destroy();
    
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
            // console.log(req.status);

            const { username, email, password } = req.body;
            console.log({"username:": username}, {"email:" : email}, {"password:": password});

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
    profileCompletion: async (req, res, error) => {
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
                user = await registerUser(req.session.registrationData.username, req.session.registrationData.email, req.session.registrationData.password, userDetails);
                // Redirect user to success page or any other appropriate action
                // res.redirect('./Profile.html');
                
                return res.status(200).json({message: 'Profile completed successfully'}); // Send success response here
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


module.exports = { authController, registerUser, hashPassword, updateUserProfile, mapSessionToUser };