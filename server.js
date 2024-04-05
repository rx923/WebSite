const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const WebSocket = require('ws');
const { hostname } = require('os');
const { authController } = require('./controllers/auth');
const profileRoutes = require('./controllers/profileRoutes.js');
const { getCurrentPassword, updatePassword } = require('./routes/passwordService');
const { error } = require('console');
const sessionMiddleware = require('./models/sessionConfig');

const { sequelize } = require('./models/sessionModel');





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

// Your authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/logged_in.html');
    }
}

// Route to fetch user information
app.get('/user/profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Assuming you have access to a User model
        const user = await user.findByPk(req.session.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Constructing user object with relevant information
        const userInfo = {
            username: user.username,
            email: user.email,
            location: user.location,
        };

        // Sending user information as JSON response
        res.json(userInfo);
    } catch (error) {
        console.error('Error fetching user information: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/send-message', (req, res) => {
    //Retreiving the message from the request body
    const message = req.body.message;

    console.log('Received message:', message);

    res.send('Message received successfully!');
});



app.post('/support-group')

app.get('/logged_in', (req, res) => {
    const username = req.session.username;
    res.render('logged_in', { username: username });
});

app.get('/Profile.html', (req, res) => {
     // Assuming you have a view engine set up
    res.render('profile', { user: userDetails });
});


// Route for user password reset
app.post('/reset-password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    // Assuming you're using session middleware that populates req.user
    const userId = req.user.id;

    try {
        // Retrieve the stored password from the database
        const storedPassword = await getCurrentPassword(userId);

        // Compare the current password provided by the user with the stored password
        const passwordMatch = await bcrypt.compare(currentPassword, storedPassword);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Current password is incorrect.' });
        }

        // Update the password in the database
        await updatePassword(userId, newPassword);

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
});


//Route for the products

app.get('/api/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'Products_lists', 'produse.json'));
});



// Sync Sequelize models with the database
sequelize.sync()
    .then(() => {
        console.log('Database synced');
    })
    .catch(error => {
        console.error('Database sync error:', error);
    });



// Create the server
const server = http.createServer(app);

// WebSocket setup
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    // Handle WebSocket connections here
});

// Start listening
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT} ${hostname}`);
});

module.exports = app;
