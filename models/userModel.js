const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { addPasswordHashHook, saltRounds } = require('./userHooks.js');
const { sequelize: dbInstance } = require('../routes/db_config.js'); 

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || '192.168.100.53',
  port: process.env.DB_PORT || '5432',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'MainAdministrator',
  database: process.env.DB_NAME || 'AccountCreation',
});

const User = sequelize.define('User', {
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
  full_name: {
      type: DataTypes.STRING(255), 
      allowNull: false, 
  },
  location: {
      type: DataTypes.STRING(255),
      allowNull: false,
  },
  phone_number: {
      type: DataTypes.STRING(20), 
      allowNull: false,
  },
  contact_details: {
      type: DataTypes.TEXT(200),
      allowNull: false,
  },
  address: {
      type: DataTypes.TEXT(100),
      allowNull: false,
  },
  country_of_residence: {
      type: DataTypes.STRING(100),
      allowNull: false,
  },
  createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
  },
  updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
  },
  first_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
  },
  last_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
  },
  profilepicturefilename: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  profilepicturefilepath: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  profilepicturefilesize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  profilepicturemimetype: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  profilepictureuploaddate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, { tableName: 'users' });

addPasswordHashHook(User);


const Session = sequelize.define('Session', {
  sid: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  expire: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
}, { tableName: 'sessions' });



(async () => {
  try {
    await sequelize.sync();
    console.log('User table synchronized successfully.');
    
    const users = await User.findAll({
      where: {
        username: Sequelize.literal('"User"."username" = \'3\'')
      }
    });
    
    console.log('Users:', users);
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

User.findByUsername = async (username) => {
  try {
    const user = await User.findOne({ 
      where: { 
        username: username // Comparing directly with the provided username
      }, 
      attributes: ['id', 'username', 'password'] 
    });
    return user;
  } catch (error) {
    console.error('Error retrieving user by username: ', error);
    throw error;
  }
};


const updateUserProfile = async (userId, profileData) => {
  try {
      const user = await User.findByPk(userId);
      if (!user) {
          throw new Error('User not found');
      }
      
      await user.update(profileData);
      console.log('User profile updated successfully');
  } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
  }
};

module.exports = { User, registerUser, updateUserProfile, sequelize };
