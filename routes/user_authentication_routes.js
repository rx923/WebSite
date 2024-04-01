const express = require('express');
const router = express.Router();
const { User } = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { Session } = require('../models/sessionModel.js');


// importing the necessary modules/models
// const User = require('../models/User');


//Defining routes for user-related functionality
router.post('/register', async(req, res) =>{
    // To be written;
});

router.post('/', async (req, res) => {
    // To be written;
});

//Some other user routes:
module.exports = router;



// Defining routes for the authentication functionality:
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate username and password
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Authenticate user and generate token
        const authResult = await authenticateAndGenerateToken(req, username, password);

        // Handle authentication result
        if (authResult.error) {
            return res.status(401).json({ error: authResult.error });
        }

        const { token, user } = authResult;

        // Store user ID in session
        req.session.user_id = user.id;

        // Redirect or send response with token
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Defining route for logout functionality:
router.post('/logout', async (req, res) =>{
    // To be written;
});


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

function generateSessionId() {
    return uuidv4;
}

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

// authenticateAndGenerateToken function
async function authenticateAndGenerateToken(req, providedUsername, providedPassword) {
    try {
        // Authenticate user
        console.log('Authenticating user:', providedUsername);
        const user = await User.findOne({ where: { username: providedUsername } });

        if (!user) {
            console.error('User not found:', providedUsername);
            return { error: 'Invalid username or password.' };
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(providedPassword, user.password);

        if (!isPasswordValid) {
            console.error('Invalid password for user:', providedUsername);
            return { error: 'Invalid username or password.' };
        }

        console.log('User authenticated successfully:', providedUsername);

        // Generate auth token
        const token = await generateAuthToken(req, user, Date.now());

        // Set expiration time
        // 1 hour expiration
        const expire = new Date(Date.now() + 3600000); 

        // Store token in database with expiration time
        await storeTokenInDatabase(req.session.id, user.id, token, expire);

        return { token, user };
    } catch (error) {
        console.error('Error authenticating user and generating token:', error);
        throw error;
    }
};


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
        throw error;
    }
};

async function mapSessionToUser(sessionId, userId) {
    try {
        const session = await Session.findOne({ where: { sid: sessionId } });
        if (!session) {
            throw new Error('Session not found.');
        }

        await session.update({ user_id: userId });

        console.log('Session mapped to user successfully');
    } catch (error) {
        console.error('Error mapping session to user:', error.message);
        return null;
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

// Other authentication routes:
module.exports = { User, Session, router, updateUserProfile, mapSessionToUser, authenticateAndGenerateToken, updateSessionuser_id, generateSessionId };