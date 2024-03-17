// authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Adjust the path accordingly
const { User } = require('../models/userModel.js');
const { use } = require('../server.js');
const session = require('express-session');
const validator = require('validator');

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


const registerUser = async (username, email, password) => {
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

        // Hash the plaintext password before ing it in the database
        const hashedPassword = await hashPassword(password);

        // Register the new user
        const newUser = await User.create({ username, email, password: hashedPassword });
        console.log('User created:', newUser);

        return newUser;
    } catch (error) {
        console.error('Error registering user:', error.message);
        throw error;
    }
};


const authenticateAndCompare = async (providedUsername, providedPassword) => {
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
        return { token, user };
    } catch (error) {
        console.error('Error authenticating user:', error);
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
        req.session.userId = User.id;
        // Check if username and password are provided
        const { username, password } = req.body;
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('Session ID:', req.session.id);
        console.log('User ID:', req.session.userId);
        console.log('Session Cookie:', req.session.cookie);        
        if (!username || !password) {
          return res.status(400).json({ error: 'Username and password are required.' });
        }
      
        try {
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
          req.session.username = { id: user.id, username: user.username };
        //   res.status(200).json({ message: 'Login successful', token, user: req.session.user });
          res.redirect('/logged_in.html');
          
        } catch (error) {
          console.error('Error logging in:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Other controller functions like logout, register, etc.
    logout: async (req, res) => {
        try {
            // Destroy the session to log the user out
            req.session.destroy();
            // res.status(200).json({ message: 'Logout successful' });
            res.redirect('/index.html');
            console.log('session ended: ', session);
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).json({ message: 'Internal server error' });
        }

    },
    register: async (req, res) => {
        try {
            req.session.userId = User.id;
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

            // Register the new user


            req.session.registrationData = { username, email, password };

            res.redirect('/Inregistrare_User_Completare_Profil.html');


        } catch (error) {
            console.error('Error registering user:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    profileCompletion: async (req, res) => {
        try {
            req.session.userId = User.id;
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
    
            // Find the user in the database based on their username or email
            const user = await User.findOne({ $or: [{ username: req.session.registrationData.username }, { email: req.session.registrationData.email }] });
    
            // Split the contactDetails string into individual details
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
            // Update the user's profile with the sanitized and escaped data
            user.full_name = sanitizedFullName;
            user.first_name = sanitizedFirstName;
            user.last_name = sanitizedLastName;
            user.location = sanitizedLocation;
            user.phone_number = sanitizedPhoneNumber;
            user.contact_details = sanitizedContactDetails;
            user.address = sanitizedAddress;
    
            // Save the updated user profile without Sequelize validation
            await user.save({ validate: false });
    
            // Register the user
            await registerUser(req.session.registrationData.username, req.session.registrationData.email, req.session.registrationData.password);
    
            // Save user profile completion data
            await registerUserProfile(req.session.registrationData, {
                full_name: sanitizedFullName,
                location: sanitizedLocation,
                phone_number: sanitizedPhoneNumber,
                contact_details: sanitizedContactDetails,
                address: sanitizedAddress
            });
    
            // Clear registration data from session
            delete req.session.registrationData;
    
            // Redirect user to success page or any other appropriate action
            res.redirect('/Profile.html');
        } catch (error) {
            console.error('Error submitting profile:', error);
            res.status(500).json({ message: 'Error submitting profile' });
        }
    }
};

module.exports = { authController, registerUser, hashPassword, updateUserProfile };