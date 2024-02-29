const { Sequelize, DataTypes } = require('sequelize');

const router = express.Router();
const authController = require("../controllers/auth");



// Initialize Sequelize instance
const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || '192.168.100.53',
    port: process.env.DB_PORT || '5432',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'MainAdministrator',
    database: process.env.DB_NAME || 'AccountCreation',
});

// Define the User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        // Ensures that each username is unique
        unique: true 
    },
    email: {
        type: DataTypes.STRING,
        // Ensures that each email is unique
        unique: true 
    },
    password: DataTypes.STRING,
});

// Establish database connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Function to create a new user
const createUser = async (userData) => {
    try {
        const newUser = await User.create(userData);
        console.log('New user created:', newUser.username);
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Function to check if username or email already exist in the database
const checkExistingUser = async (username, email) => {
    const existingUser = await User.findOne({
        where: {
            [Sequelize.Op.or]: [{ username }, { email }]
        }
    });
    return existingUser !== null;
};

// Sync the User table if it doesn't exist
sequelize.sync()
    .then(() => {
        console.log('User table synchronized successfully.');
    })
    .catch(err => {
        console.error('Unable to synchronize User table:', err);
    });


router.post('/Inregistrare.html', authController.register);

router.post('/Logare.html', authController.login);
router.post('/Logout.html', authController.logout);

// Export the User model and functions
module.exports = { User, createUser, checkExistingUser };