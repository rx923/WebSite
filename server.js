const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");
const pool = require('./routes/db_config').pool;
const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Routes
const pagesRouter = require('./routes/pages');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users'); // Import the users route

app.use('/', pagesRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter); // Use the users route for user account creation

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

// Server start
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});