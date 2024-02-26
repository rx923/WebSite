const { DataTypes } = require('sequelize');
// Import the Sequelize instance
const sequelize = require('./users'); 

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

// Function to create a new user
// Function to create a new user with verification
async function createUser(username, email, password) {
    try {
      // Retrieve all users from the database
      const allUsers = await User.findAll({ database: 'AccountCreation' });
  
      // Count occurrences of email and username
      let countAccountsWithEmail = 0;
      let countAccountsWithUsername = 0;
  
      allUsers.forEach(user => {
        if (user.email === email) {
          countAccountsWithEmail++;
        }
        if (user.username === username) {
          countAccountsWithUsername++;
        }
      });
  
      // Check if the email already exists
      if (countAccountsWithEmail > 0) {
        throw new Error('An account with this email already exists.');
      }
  
      // Check if the maximum number of accounts per email has been reached
      if (countAccountsWithEmail >= 2) {
        throw new Error('Maximum accounts per email reached.');
      }
  
      // Check if the username is already taken
      if (countAccountsWithUsername > 0) {
        throw new Error('This username is already taken.');
      }
  
      // Create user in the database
      const newUser = await User.create({
        username,
        email,
        password
      });
      console.log('User created successfully:', newUser.toJSON());
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  

module.exports = User; // Export the User model