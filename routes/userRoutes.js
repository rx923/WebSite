const express = require('express');
const router = express.Router();
const { sequelize, DataTypes } = require('./databaseConfig');
const User = require('../models/User');


const { Sequelize, DataTypes } = require('sequelize');

// Database connection configuration
const sequelize = new Sequelize({
  // Your database host
  host: '192.168.100.53', 
  // Your database port (5432 is the default for PostgreSQL)
  port: 5432, 
  // Your database name
  database: 'AccountCreation', 
  // Your database username
  username: 'postgres', 
  // Your database password
  password: 'MainAdministrator', 
  // The dialect of the database you are using (e.g., 'mysql', 'postgres', 'sqlite')
  dialect: 'postgres' 
});

router.get('/profile', async (req, res) => {
  try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Finding user in the database using the session ID
      const user = await User.findByPk(req.session.user.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Construct user info object
      const userInfo = {
        username: user.username,
        email: user.email,
        location: user.location,
        joined: user.createdAt
      };

      // Sending user information as JSON response
      res.json(userInfo);
  } catch (error) {
    console.error('Error fetching user information: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/profile', async (req, res) => {
  try {
      if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Finding user in the database using the session ID
      const user = await User.findByPk(req.session.user.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Construct user info object
      const userInfo = {
        username: user.username,
        email: user.email,
        location: user.location,
        joined: user.createdAt
      };

      // Sending user information as JSON response
      res.json(userInfo);
  } catch (error) {
      console.error('Error fetching user information: ', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = {sequelize, DataTypes, router};