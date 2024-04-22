const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const WebSocket = require('ws');
const { hostname } = require('os');
const { authController } = require('./controllers/auth');
const profileRoutes = require('./controllers/profileRoutes.js');
const { getCurrentPassword, updatePassword } = require('./routes/passwordService');
const { error } = require('console');
const {sessionMiddleware} = require('./models/sessionConfig');
const sessionDeletions  = require('./routes/sessionDeletions.js');
const { sequelize } = require('./models/sessionModel');
const { User } = require("./models/userModel.js"); 
const bodyParser = require('body-parser');
const { fetchUserProfile } = require('./controllers/userController.js');
const { deleteInactiveSessions } = require('./routes/sessionDeletions.js');
const { generateRandomPasswordAndUpdate } = require('./routes/passwordService'); // Import the function


// const chatButtonForm = require('./chat-button-form-group');
const app = express();
const PORT = process.env.PORT || 8081;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(sessionMiddleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(cors());

app.use(express.static('public'));
app.post('/login', authController.login);
app.post('/logout', authController.logout);
app.use('/register', authController.register);
app.use('/submit-profile-completion', authController.profileCompletion);
app.post('/profile-photo', profileRoutes);
app.post('/send-message', (req, res) => {
    //Retreiving the message from the request body
    const message = req.body.message;

    console.log('Received message:', message);

    res.send('Message received successfully!');
});



app.post('/support-group')

// Route for user password reset
app.post('/reset-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        await updatePassword(email, newPassword);
        // await sendPasswordResetEmail(email, newPassword);
        // Send success message
        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
});


// Your authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/logged_in.html');
    }
}

app.get('/user/profile', async (req, res) => {
    try {
        // Check if the user is logged in
        if (!req.session || !req.sessionID) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Fetch user profile based on the session's username
        const userProfile = await fetchUserProfile(req.session.user.username);

        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.render('Profile.ejs', { user: userProfile }); 
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/logged_in', (req, res) => {
    const username = req.session.username;
    res.render('logged_in', { username: username });
});
app.get('/Profile.html', (req, res) => {
     // Assuming you have a view engine set up
    res.render('profile', { user: userDetails });
});
//Route for the products
app.get('/api/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'Products_lists', 'produse.json'));
});
app.get('/wrong_username', (req, res) => {
    res.render('wrong_username', { pageTitle: 'Wrong Username' });
});
app.get('/wrong_password', (req, res) => {
    res.render('wrong_password', { pageTitle: 'Wrong Password' });
});

function getUserIdFromSession(sessionHash) {
    // Logic to retrieve user ID from session based on hash
    // Example:
    return sessions[sessionHash].userId;
}
// Sync Sequelize models with the database
sequelize.sync()
    .then(() => {
        console.log('Database synced');
    })
    .catch(error => {
        console.error('Database sync error:', error);
});



app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Generate a random password and update it in the database
        const temporaryPassword = await generateRandomPasswordAndUpdate(email, res);
        
        console.log('Temporary Password:', temporaryPassword);
        res.redirect('/password_reset_success.html');
    } catch (error) {
        console.error('Error generating and updating password:', error);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
});
// Create the server
const server = http.createServer(app);

// WebSocket setup
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    // Handle WebSocket connections here
});


sessionDeletions();



// Start listening
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT} ${hostname}`);
});

// setInterval(deleteInactiveSessions, 10 * 60 * 1000); // 10 minutes

module.exports = app;