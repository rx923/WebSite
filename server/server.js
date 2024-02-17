//This is the express server for serving the files.
const express = require('express');
const cors = require("cors");
const {Sequelize, DataTypes } = require('sequelize');
const path = require('path')
const HOST = '192.168.100.53';

const app = express();

//Middleware

// app.use(cors());
// The below code serves the static files.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


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



//Synchornizing the model with the database (create the table if it doesn't exist)
(async () => {
    await sequelize.sync({alert: true});
    console.log('Database synchornized');
})();

//Route to serve the Logare.html file
app.get('/WebSite/ComputerLaptop_WebSite/Inregistrare&Logare_user/Logare.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inregistrare&Logare_user', 'Inregistrare.html'));
});


//Route to handle the user registration
app.post('/WebSite/ComputerLaptop_WebSite/Inregistrare&Logare_user/Inregistrare.html', async (req, res) => {
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


const PORT = process.env.PORT || 8081;
app.listen(PORT, HOST, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});


