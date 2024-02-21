
//This is the express server for serving the files.
const HOST = '192.168.100.53';
const PORT = process.env.PORT || 8081;
const User = require('/users.js')

startTime = time.now



const express = require('express');
const cors = require("cors");
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const { METHODS } = require('http');
const { time } = require('console');
// const routes = require('./public/routes');
//Importing some routes
// const server_authentication_routes = require('./public/routes/server_authentication_routes');
// const user_authentication_routes = require('./public/routes/user_authentication_routes');
// const establishing_connection_routes = require('./public/routes/establishing_connection_routes');
const app = express();
//Using the routes:
// app.use('/', establishing_connection_routes);
// app.use('/auth/server', server_authentication_routes);
// app.use('/auth/user', user_authentication_routes);


//Middleware

app.use(cors());
app.use((req, res, next) => {
    const startTime = Date.now();
    // Recording the current timestamp fo the request in UTC format:
    console.log('Request type:', req.method);
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log('Request completed in :', duration, 'ms', '---Request type:', req.method);
    });
    next();
});

// The below code serves the static files.
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['css'] 
}));
//Parsing JSON bodies
app.use(express.json());
app.use(express.static('files'))
app.use(express.static('/Plan_Afacere/WebSite/public/css', (req, res, next) => {
    res.setHeader('Contet-Type', 'text/css');
    next();
}));
// Serve static files from the 'Plan_Afacere' directory
app.use('/css', express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', 'css')));

//Creating a database connection
const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || '192.168.100.53',
    protocol: process.env.DB_PORT || '5432',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'MainAdministrator',
    database: process.env.DB_NAME || 'AccountCreation',
});

//Route to handle the user registration
app.post('/InregistrareForm/', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await User.create({ username, email, password });
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server is listening on ${HOST}:${PORT}`);
});

// app.use('/', routes);