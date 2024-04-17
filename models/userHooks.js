const bcrypt = require('bcryptjs');
const { saltRounds } = require('../config/constants');

const addPasswordHashHook = (User) => {
    User.addHook('beforeCreate', async (user) => {
        try {
            // Check if password is provided
            if (!user.password) {
                throw new Error('Password is required.');
            }

            // Hash the plaintext password
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);

            // Store the hashed password in the database
            user.password = hashedPassword;
        } catch (error) {
            console.error('Error hashing password:', error);
            throw error;
        }
    });
};

module.exports = { addPasswordHashHook };
