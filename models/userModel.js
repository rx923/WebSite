const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Sequelize, DataTypes } = require('sequelize');

// Generate a random secret for session
const generateRandomSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};

const sequelize = new Sequelize('AccountCreation', 'postgres', 'MainAdministrator', {
    dialect: 'postgres',
    host: '192.168.100.53',
    port: 5432
});

// Define the User model
const User = sequelize.define('User', {
    // Define the model attributes
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Sync the model with the database
sequelize.sync()
    .then(() => {
        console.log('User model synchronized successfully.');
    })
    .catch((error) => {
        console.error('Unable to synchronize User model:', error);
    });

// Export the User model and sequelize instance
module.exports = { User, sequelize };
