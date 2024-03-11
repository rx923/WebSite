const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const WebSocket = require('ws');
const { pool, configureSession, initializeDatabase } = require('./routes/db_config'); // Import configureSession and initializeDatabase
const pagesRouter = require('./routes/pages');
const { User } = require('./models/userModel.js');
const isLoggedIn = require('./controllers/loggedin');
const handleLogin = require('./handleLogin');
const isAuthenticated = require('./controllers/isAuthenticated');
const loginController = require('./controllers/login')
const PORT = process.env.PORT || 8081;
const { generateRandomSecret } = require('./sessionConfig'); 
const app = express();
const secretKey = generateRandomSecret();


app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));

// Initialize session middleware
configureSession(app);

// Initialize database
initializeDatabase();

// Use routers
app.use(pagesRouter);
app.use(bodyParser.json());
// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Route for user registration
app.post('/register', async (req, res) => {
    try {
        // Check if req.body exists
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is missing.' });
        }

        // Check if username, email, and password are provided
        if (!req.body || !req.body.username || !req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'Username, email, and password are required.' });
        }

        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        // Check if the email already exists
        const existingEmailUser = await User.findOne({ where: { email } });
        if (existingEmailUser) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }
        if (password.length < 6) {
            return res.status(400).json("Password must be longer than 6 character");
        };
        
        // Check if the username is already taken
        const existingUsernameUser = await User.findOne({ where: { username } });
        if (existingUsernameUser) {
            return res.status(400).json({ error: 'This username is already taken.' });
        }

        // Create user in the database
        const newUser = await User.create({
            username,
            email,
            password
        });
        console.log('User created:', newUser);

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});





const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/logged_in.html');
    }
}
app.get('/logged_in.html', requireAuth, (req, res) => {
    res.sendFile('/logged_in.html');
});

const validCredentials = async (username, password) => {
    console.log(validCredentials);
    try {
        const user = await User.findOne({ where: { username }});

        if (!user) {
            return false;
        }
        console.log('Password:', password);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(isPasswordValid){
        return isPasswordValid;
        }
    } catch (error) {
        console.error('Error validating credentials: ', error);
        return false;
    }
    
}


const saltRounds = 10; // Adjust the number of salt rounds as needed
// Inside your login route handler
app.post('/login', async (req, res) => {
    const { username, 'password-user': password } = req.body;

    try {
        // Retrieve user from the database based on the username
        const user = await User.findByUsername(username);

        if (!user) {
            // User not found
            return res.status(404).send("User not found");
        }

        // Compare the provided password with the hashed password from the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password from request body: ", password);
        console.log("Hashed password from database: ", user.password);

// Inside your login route handler
app.post('/login', async (req, res) => {
    const { username, password} = req.body;
    //Validating the user credentials
    if (validCredentials(username, password)) {
    try {
        const isValid = await validCredentials(username, password);
        if (isValid) {
            const userId = await User.findByUsername(username);
            console.log(userId);
            if (userId) {
                // Set the user ID in the session
                req.session.userId = userId;
                res.redirect('/dashboard');
            } else {
                res.render('login', {error: "User not found" });
            }
        } catch(error){
            console.error('Error handling login: ', error);
        // Set error message in session
        req.session.error = "Internal server error";
        // Send 500 Internal Server Error response
        return res.status(500).send("Internal server error");
    }
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile('/dashboard');
})
        
        console.log(`Found ${usersWithPlainTextPasswords.length} users with plain text passwords.`);
        
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
            // If login unsuccessful, return error message
            return res.status(401).json({ message: result.message });
        }

        console.log('Passwords hashed successfully for existing users.');

        // Write updated users to a text file
        const updatedUsersFilePath = path.join('U:', 'WebSite', 'updated_users.txt');
        fs.writeFileSync(updatedUsersFilePath, updatedUsers.map(user => `${user.id}, ${user.username}`).join('\n'));
        console.log(`Updated users written to file: ${updatedUsersFilePath}`);

        // Write original users to a text file
        const originalUsersFilePath = path.join('U:', 'WebSite', 'original_users.txt');
        fs.writeFileSync(originalUsersFilePath, usersWithPlainTextPasswords.map(user => JSON.stringify(user, null, 2)).join('\n'));
        console.log(`Original users written to file: ${originalUsersFilePath}`);
    } catch (error) {
        console.error('Error handling login:', error);
        res.status(500).json({ message: 'Internal server error' });
        } else {
            res.redirect('/index.html');
    }
});
app.use(express.static('public'));


const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    User.findAll()
        .then((users) => {
            ws.send(JSON.stringify(users));
        })
        .catch((error) => {
            console.error('Error fetching user data: ', error);
        });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
