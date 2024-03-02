const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");
const pool = require('./routes/db_config').pool;
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8081;
const authRoutes = require('./controllers/auth');
const { createUser } = require('./routes/creation_of_user_accounts')
const { login } = require('./controllers/auth');


// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
// Use authRoutes as middleware
// app.use('/', authRoutes); 

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

// Route handler for user login
app.post('/login', async (req, res) => {
    try {
        // Call the login function passing the request and response objects
        await login(req, res);
    } catch (error) {
        console.error('Error handling login: ', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});

app.post('/login', async (req, res) => {
    try {
        // Call the login function passing the request and response objects
        // Assuming login function is available here
        await login(req, res); 
    } catch (error) {
        console.error('Error handling login: ', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});


// Server start
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// Exporting app
module.exports = app;
