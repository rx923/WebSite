const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require('sequelize');

const app = express();

// Middleware
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

// Start the express server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
});

// Start the live-http server
var liveServer = require("live-server");

var params = {
  port: 8080, // Set the server port. Defaults to 8080.
  host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  root: "/public", // Set root directory that's being served. Defaults to cwd.
  open: false, // When false, it won't load your browser by default.
  ignore: 'scss,my/templates', // comma-separated string for paths to ignore
  file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
  mount: [['/components', './node_modules']], // Mount a directory to a route.
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
  middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
};
liveServer.start(params);
