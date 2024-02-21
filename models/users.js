const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const express = require('express');
const User = require('./models/users.js');




const User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
});

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

module.exports = User;
