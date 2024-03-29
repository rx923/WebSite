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
// const profileRouter = require('./controllers/profileRoutes');
const profileCompletionRouter = require('./controllers/auth.js');



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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(cors());
// app.use('/auth', authController); 
app.post('/login', authController.login);
app.post('/logout', authController.logout);
app.use('/register', authController.register);
app.use('/submit-profile-completion', authController.profileCompletion);



// Mount the profile completion router
// app.use('/submit-profile', profileCompletionRouter);

// Your authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/logged_in.html');
    }
}

app.get('/logged_in', (req, res) => {
    const username = req.session.username;
    res.render('logged_in', { username: username });
});

app.get('/Profile.html', (req, res) => {
     // Assuming you have a view engine set up
    res.render('profile', { user: userDetails });
});

// app.use(upload.single('profilePicture'));
app.use('/profile', profileRoutes);


app.post('/profile-photo', async(req, res) => {
    try {
    //Forwarding the request to profileRoutes.js
    //Passing the req body to profileRoutes.js if necessary

    const result = await fetch('http://192.168.100.53:8081/profile-photo', {
        method: 'POST',
        body: req.body,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await result.json();
    res.status(result.status).json(data);
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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