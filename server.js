const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const session = require('express-session');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const { User, sequelize } = require('./models/userModel');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { pool } = require('./routes/db_config');
const authRoutes = require('./controllers/auth');
// Removed the import of User here
const { createUser } = require('./routes/creation_of_user_accounts'); 
const login = require('./controllers/login');
const loggedIn = require('./controllers/loggedin.js');
// const { isAuthenticated } = require('./controllers/auth.js');
const userModels = require('./models/userModel.js');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 8081;
const { initializeDatabase } = require('./routes/db_config');

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(loggedIn);

// Configuring body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
initializeDatabase(app);

// Route to handle incoming POST requests containing user data from the Python Script
app.post('/user-data', (req, res) => {
    // Assuming req.body contains the user data sent from the Python script
    const userData = req.body;
    console.log('Received user data:', userData);
    res.status(200).send('User data received successfully.');
});

// Define a route that triggers the execution of the Python script
app.post('/execute-python-script', (req, res) => {
    const requestBody = req.body;

    //Logging the request body
    console.log('Request Body', requestBody);
    const pythonProcess = spawn('python', ['./retrieving_database_user_information/db_connecting_retrieval_credentials.py']);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script process exited with code ${code}`);
    });

    res.send('Python script execution triggered.');
});

//Generate a random secret for session
const generateRandomSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Session configuration for the user login:
// Configure session middleware
app.use(session({
    secret: generateRandomSecret(),
    resave: false,
    saveUninitialized: true,
    // Session duration: 1 minute (in milliseconds)
    cookie: { maxAge: 60000 }
}));

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// Route handler for the logged_in page
app.get('/logged_in', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, './public/logged_in.html'));
});

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
router.post('/login', async (req, res) => {
    try {
        const loggedIn = await login(req);
        if (loggedIn) {
            // Redirect to the logged-in page upon successful login
            res.redirect('/logged_in');
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        console.error('Error handling login: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.use(router);

// Route handler for user registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await createUser(username, email, password);
        console.log("Account successfully created: ", newUser);
        res.send("Account successfully created.");
    } catch (error) {
        console.error("Error creating user:", error.message);
        res.status(500).send("Error creating user.");
    }
});

// Route handler for user logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            res.redirect('/login');
        }
    });
});

// Creating the HTTP server
const server = http.createServer(app);

// Initializing WebSocket server
const wss = new WebSocket.Server({ server });

//WebSocket connection event handler
wss.on('connection', (ws) => {
    //Fetching user data from the database
    User.findAll()
        .then((users) => {
            //Sending user data to the client
            ws.send(JSON.stringify(users));
        })
        .catch((error) => {
            console.error('Error fetching user data: ', error);
        });
});

// Server start
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// Exporting app
module.exports = app;
