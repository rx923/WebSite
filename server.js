const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const WebSocket = require('ws');
const { ValidationError } = require('sequelize');
const { pool, initializeDatabase } = require('./routes/db_config');
const pagesRouter = require('./routes/pages');
const isLoggedIn = require('./controllers/loggedin');
const handleLogin = require('./controllers/handleLogin');
const loginController = require('./controllers/login');
const printLoggedInSessions = require('./controllers/loggedin');
const { login } = require('./controllers/login');
const bcrypt = require ('bcryptjs');
const PORT = process.env.PORT || 8081;
const router = express.Router();
const { Op, DataTypes, Sequelize } = require('sequelize');
const { configureSession } = require('./routes/db_config');
const { registerUser } = require('./models/userModel.js'); 
const { User } = require('./models/userModel.js');
const {authController} = require('./controllers/auth');

const app = express();

configureSession(app);

// printLoggedInSessions(User);
// printLoggedInSessions(pool);

// router.get('./logged_in.html', (req, res) => {
//     // Get error message from session (if any)
//     const error = req.session.error;
//     // Clear error message from session
//     req.session.error = null;
//     // Render the logged_in.html page with error message
//     res.render('./logged_in.html', { error });
// });

// router.post('/logged_in.html', (req, res) => {
//     // Handle the form submission here
//     // For example, you can access form data from req.body
//     const formData = req.body;
//     // Process the form data as needed

//     // Redirect the user to another page after handling the form submission
//     res.redirect('/another-page.html');
// });



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.get('/', (req, res) => {
    res.render('index');
    
})

const createSession = (req, userId) => {
    req.session.userId = userId;
}

app.use(session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false}
}));


initializeDatabase();

app.use(pagesRouter);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.post('/register', authController.register);


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

const saltRounds = 10; // Adjust the number of salt rounds as needed
// Inside your login route handler

app.post('/login', authController.login);



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

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
