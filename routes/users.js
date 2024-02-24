// ./public/models/users.js

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

// Define the User model
const User = sequelize.define('User', {
  // Define the properties of the User model
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isAlphanumeric: true,
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isAlphanumeric: true,
    }
  }
});

// Export the User model
module.exports = User;
