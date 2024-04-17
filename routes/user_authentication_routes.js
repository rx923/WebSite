const express = require('express');
const router = express.Router();
const { User } = require('../models/userModel.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { Session } = require('../models/sessionModel.js');
const { HashUserPassword } = require('../controllers/auth.js')
const crypto = require('crypto');



function generateRandomSecretKey(length = 32) {
    // Generate a random buffer of appropriate length
    const buffer = crypto.randomBytes(length);
    
    // Convert the buffer to a string with UTF-8 encoding
    const secretKey = buffer.toString('utf-8');

    return secretKey;
}
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

// Route handler for user login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Authenticate user
        const authenticationResult = await authenticateAndGenerateToken(req, username, password);

        // Check if authentication was successful
        if (authenticationResult.error) {
            console.error('Error authenticating user:', authenticationResult.error);
            return res.status(401).render('login', { error: 'Invalid username or password' });
        }

        // User authenticated successfully
        console.log('User authenticated successfully:', username);

        // Generate auth token
        const token = await generateAuthToken(req, authenticationResult.user, Date.now());

        // Set expiration time (1 hour expiration)
        const expire = new Date(Date.now() + 3600000); 

        // Store token in database with expiration time
        await storeTokenInDatabase(req.session.id, authenticationResult.user.id, token, expire);

        // Store user ID in session
        req.session.user_id = authenticationResult.user.id;

        // Map session to user
        await mapSessionToUser(req.session.id, authenticationResult.user.id);

        // Redirect user to logged-in page
        res.redirect('/logged_in.html');
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).render('login', { error: 'Internal server error' });
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

        // Generate a random secret key
        const secretKey = generateRandomSecretKey();

        // Generate the JWT token
        const payload = {
            id: userId,
            loginTimestamp: loginTimestamp
        };

        // Set expiration time
        const expire = new Date(Date.now() + 3600000); 

        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        console.log(token);

        // Store the token in the database with expiration time
        await storeTokenInDatabase(req.session.id, userId, token, expire);

        return token;
    } catch (error) {
        console.error('Error generating auth token:', error);
        throw error;
    }
};


// authenticateAndGenerateToken function
const authenticateAndGenerateToken = async (req, username, password) => {
    try {
        
        // Find the user by username
        const user = await User.findOne({ where: { username: username }, attributes: ['id', 'username', 'password'] });
        console.log(user, username, password);
        // If user not found, return error
        if (!user) {
            return { error: 'Invalid username or password.' };
        }

        // Compare input password with stored hashed password synchronously
        const passwordMatch = bcrypt.compareSync(password, user.password);
        console.log("Password comparison result: ", passwordMatch, "\nProvided Password: ", password, "\n user.password", user.password);
        // If passwords don't match, return error
        if (!passwordMatch) {
            return { error: 'Invalid username or password.' };
        }

        // Return the user object and password match status
        return { user: user, passwordMatch: passwordMatch };
    } catch (error) {
        console.error('Error authenticating user:', error);
        return { error: 'Internal server error. Please try again later.' };
    }
};

async function storeTokenInDatabase(sid, userId, token, expire) {
    try {
        // Ensure userId is a valid integer
        userId = parseInt(userId);
        console.log(userId);
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
        // if (error instanceof DatabaseError || error.name === 'SequelizeUniqueConstraintError') {
        //     console.error('Session with the same sid already exists. Inform the user about the login issue.');
        //     throw new Error('Login failed. Please try again.');
        // } else {
        //     console.error('Error storing token in database:', error);
        //     throw error;
        // }
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


// Other authentication routes:
module.exports = { User, Session, router, updateUserProfile, mapSessionToUser, authenticateAndGenerateToken, updateSessionuser_id, generateAuthToken, storeTokenInDatabase };