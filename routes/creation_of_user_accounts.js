const { Sequelize, DataTypes, ValidationError } = require('sequelize');

// Initialize Sequelize with PostgreSQL credentials
const sequelize = new Sequelize(
    process.env.DB_NAME || 'AccountCreation', 
    process.env.DB_USER || 'postgres', 
    process.env.DB_PASSWORD || 'MainAdministrator', 
    {
        host: process.env.DB_HOST || '192.168.100.53',
        port: process.env.DB_PORT || '5432',
        dialect: "postgres",
    }
);

// Define the User model
const User = sequelize.define('user', {
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
          // Password must be between 6 and 20 characters
          len: [6, 20] 
      }
  },
  created_at: { 
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
  },
  updated_at: { 
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users', 
  // Disable Sequelize's automatic timestamp fields
  timestamps: false 
});
// Function to create a new user with verification
async function createUser(username, email, password) {
    try {
        // Check if the email already exists
        const existingEmailUser = await User.findOne({ where: { email } });
        if (existingEmailUser) {
            throw new Error('An account with this email already exists.');
        }

        // Check if the maximum number of accounts per email has been reached
        const countAccountsByEmail = await User.count({ where: { email } });
        if (countAccountsByEmail >= 2) {
            throw new Error('Maximum accounts per email reached.');
        }

        // Check if the username is already taken
        const existingUsernameUser = await User.findOne({ where: { username } });
        if (existingUsernameUser) {
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
        // Handle Sequelize validation errors separately
        if (error instanceof ValidationError) {
            const validationErrors = error.errors.map(err => err.message);
            throw new Error(`Validation error(s): ${validationErrors.join(', ')}`);
        }
        console.error('Error creating user:', error.message);
        throw error;
    }
}

module.exports = { User, createUser };
