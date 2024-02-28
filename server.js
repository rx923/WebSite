const express = require('express');
const cors = require('cors');
const path = require('path');
// const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
// Import pool and dotenv from index.js
const { pool, dotenv } = require('./views/index'); 
const pg = require('pg')


const app = express();
const PORT = process.env.PORT || 8081;
const HOST = '192.168.100.53';

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'html');

const db = new pg.Pool({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((err)=>{
    if (err) {
        console.log(err);
    } else {
        console.log('PG Connected')
    }
})



app.use(cors());
app.use(express.json());
app.use('/css', express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', 'css')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'routes')));
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Database connected successfully');
        // Release the client back to the pool
        release();
    }
});

// Homepage route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Password reset endpoint (example)
app.post('/reset-password', (req, res) => {
    // Handle password reset logic here
    res.send('Password reset functionality will be implemented here');
});

app.listen(PORT, HOST, () => {
    console.log(`Server is listening on http://${HOST}:${PORT}`);
});

app.listen(8081);