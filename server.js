//This is the express server for serving the files.
const express = require('express');
const cors = require("cors");
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const { METHODS } = require('http');
// const routes = require('./public/routes');
const HOST = '192.168.100.53';
const PORT = process.env.PORT || 8081;



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
// The below code serves the static files.
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['css'] 
}));
//Parsing JSON bodies
app.use(express.json());
app.use(express.static('files'))
app.use(express.static('/Plan_Afacere/', (req, res, next) => {
    res.setHeader('Contet-Type', 'text/css');
    next();
}));
// Serve static files from the 'Plan_Afacere' directory
app.use('/Plan_Afacere/', express.static(path.join(__dirname, '/Plan_Afacere/')));

//Creating a database connection
const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || '192.168.100.53',
    prot: process.env.DB_PORT || '5432',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'MainAdministrator',
    database: process.env.DB_NAME || 'AccountCreation',
});

// Defining the User model
const User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
});

//Checking if the User table exists in the database
(async () => {
    try {
        await sequelize.authenticate();
        const tableExists = await sequelize.getQueryInterface().showAllTables();
        if (!tableExists.includes('User')) {
            await User.sync({ force: true });
            console.log('User table created successfully');
        } else {
            console.log('User table already exists');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

//Route to serve the Logare.html file
app.get('/InregistrareForm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inregistrare&Logare_user', 'Inregistrare.html'));
});


//Route to handle the user registration
app.post('/InregistrareForm', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await User.create({ username, email, password });
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// app.use('/', routes);
