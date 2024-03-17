const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const saltRounds = 10; // Adjust the number of salt rounds as needed

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || '192.168.100.53',
  port: process.env.DB_PORT || '5432',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'MainAdministrator',
  database: process.env.DB_NAME || 'AccountCreation',
});

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  fullName: {
    // Adjust data type and length as needed
      type: DataTypes.STRING(255), 
      // Adjust allowNull based on your requirements
      allowNull: true, 
  },
  location: {
      type: DataTypes.STRING(255),
      allowNull: true,
  },
  phoneNumber: {
    // Assuming phone numbers can include special characters like '+'
      type: DataTypes.STRING(20), 
      allowNull: true,
  },
  contactDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
  },
  address: {
      type: DataTypes.TEXT,
      allowNull: true,
  },
  countryOfResidence: {
      type: DataTypes.STRING(100),
      allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, { tableName: 'users' });

(async () => {
  try {
    await User.sync();
    console.log('User table synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing User table:', error);
  }
})();

const registerUser = async (username, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });
    console.log('User created:', newUser);
    return newUser;
  } catch (error) {
    console.error('Error registering user:', error.message);
    throw error;
  }
};

User.findByUsername = async(username) => {
  try {
    const user = await User.findOne({ where: { username }, attributes: ['id', 'username', 'password'] });
    return user;
  } catch (error) {
    console.error('Error retrieving user by username: ', error);
    throw error;
  }
};

module.exports = { User, registerUser };
