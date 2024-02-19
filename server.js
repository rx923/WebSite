//This is the express server for serving the files.
const express = require('express');
const cors = require("cors");
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path')
const HOST = '192.168.100.53';
const PORT = process.env.PORT || 8081;


const app = express();

//Middleware

// app.use(cors());
// The below code serves the static files.
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['css'] 
}));
app.use(express.json());
app.use(express.static('files'))
app.use(express.static('\\U:\\Plan_Afacere\\'));


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

// Defining the routes

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, HOST, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});
