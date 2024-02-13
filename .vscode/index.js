const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Database configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || '192.168.100.53',
  port: process.env.DB_PORT || '5432',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'MainAdministrator',
  database: process.env.DB_NAME || 'AccountCreation',
});

// Define your User model
const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
});

// Sync the model with the database (create the table if it doesn't exist)
(async () => {
  await sequelize.sync({ alter: true });
  console.log('Database synchronized');
})();

// Route to serve the Logare.html file
app.get('/Logare', (req, res) => {
  res.sendFile('U:/Plan Afacere/WebSite/ComputerLaptop WebSite/Inregistrare&Logare_user/Inregistrare.html');
});

// Route to handle user registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await User.create({ username, email, password });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
