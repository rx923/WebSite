const { Router } = require("express");
// const {express} = require(express);
const { pool } = require('../routes/db_config.js');
const bcrypt = require('bcryptjs');
const { User } = require("../models/userModel.js"); // Import the User model

// Creating a PostgreSQL pool
// Function to fetch the current password from the database

async function getCurrentPassword(email) {
    try {
        // Query to fetch the user's email and password based on the provided email
        const query = {
            text: 'SELECT email, password FROM users WHERE email = $1',
            values: [email],
        };

        const result = await pool.query(query);
        if (result.rows.length === 0) {
            throw new Error('User not found for email: ' + email);
        }

        const user = result.rows[0];
        const storedPassword = user.password;

        console.log('Current password retrieved successfully for user with provided email:', email);
        return { email: user.email, password: storedPassword };
    } catch (error) {
        console.error('Error fetching current password:', error);
        throw new Error('Failed to fetch current password for provided email: ' + email);
    }
}


// Function to update the password in the database
async function updatePassword(email, newPassword) {
    try {
        // Hash the new password before updating it in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Query to update the user's password based on the provided email
        const query = {
            text: 'UPDATE users SET password = $1 WHERE email = $2',
            values: [hashedPassword, email],
        };
        await pool.query(query);

        // Send success message to the user
        console.log('Password updated successfully for user with provided email:', email);
        return 'Password updated successfully.';
    } catch (error) {
        console.error('Error updating password:', error);
        throw new Error('Failed to update password.');
    }
}


// Sepparate function for a forgot password option:
// Function to generate a random password
function generateRandomPassword() {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    const maxLength = 20;
    for (let i = 0; i < maxLength; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}


module.exports = { getCurrentPassword, updatePassword };