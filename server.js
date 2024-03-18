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