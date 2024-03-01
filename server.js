const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");
const pool = require('./routes/db_config').pool;
const app = express();
const PORT = process.env.PORT || 8081;
const authRoutes = require('./controllers/auth')(app);
// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/', authRoutes);

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

// app.post('/register', require('./routes/user_authentication_routes').register);


// Server start
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
// Exporting app
module.exports = app; 