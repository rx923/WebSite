const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser'); 
const bcrypt = require('bcryptjs');
const { pool } = require('./routes/db_config'); 
const authRoutes = require('./controllers/auth');
const { createUser, User } = require('./routes/creation_of_user_accounts'); 
const login = require('./controllers/login');
const loggedIn = require('./controllers/loggedin.js');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(loggedIn);

// Configuring body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/protected-route', (req, res) => {
    res.send('You are logged in!');
});

// Routes
// const pagesRouter = require('./routes/pages');
// const authRouter = require('./routes/auth');
// Import the users route
// const usersRouter = require('./routes/users'); 

// app.use('/', pagesRouter);
// app.use('/auth', authRouter);
// Use the users route for user account creation
// app.use('/users', usersRouter); 

// Database connection check
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Database connected successfully');
        // Release the client back to the pool
        release();
    }
});

// Route handler for user login
// /login route handler
app.post('/login', async (req, res) => {
    try {
        // Check if login is successful
        const loggedIn = await login(req);

        if (loggedIn) {
            // Redirect the user to the logged_in.html page upon successful login
            res.redirect('/logged_in');
        } else {
            // Handle unsuccessful login (e.g., incorrect credentials)
            res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Error handling login: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route handler for the logged_in page
app.get('/logged_in', (req, res) => {
    res.sendFile(path.join(__dirname, './public/logged_in.html'));
});

// Route handler for user registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try { 
        const newUser = await createUser(username, email, password);
        console.log("Account successfully created: ", newUser);
        res.send("Account successfully created.");
    } catch(error) {
        console.error("Error creating user:", error.message);
        res.status(500).send("Error creating user.");
    }
});



// Route handler for user logout
app.post('/logout', (req, res) => {
    // Assuming logout function clears the session
    // Implement logout function to clear session
    logout(req, res); 
    // Redirect the user to the main page after logout
    res.redirect('/');
});



// app.put('/update/submit')

// Server start
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// Exporting app
module.exports = app;