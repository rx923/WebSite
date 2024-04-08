const { Router } = require("express");
const { Pool } = require('pg');
// const {express} = require(express);
const { pool } = require('../routes/db_config.js');
const bcrypt = require('bcryptjs');



// Creating a PostgreSQL pool




// Function to fetch the current password from the database
async function getCurrentPassword(userId) {
    try {
        // Query to fetch the user's password based on userId
        const query = {
            text: 'SELECT password FROM "AccountCreation"."users" WHERE id = $1',
            values: [userId],
        };

        const result = await pool.query(query);
        if (result.rows.length === 0) {
            throw new Error('User not found for userId: ' + userId);
        }

        // Assuming the password is stored in the 'password' column
        const storedPassword = result.rows[0].password;
        console.log('Current password retrieved successfully for user:', userId);
        return storedPassword;
    } catch (error) {
        console.error('Error fetching current password:', error);
        throw new Error('Failed to fetch current password for userId: ' + userId);
    }
}

// Function to update the password in the database
async function updatePassword(username, userId, newPassword) {
    try {
        // Hash the new password before updating it in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Query to fetch the username based on userId
        const usernameQuery = {
            text: 'SELECT username FROM "AccountCreation"."users" WHERE id = $1',
            values: [userId],
        };
        const usernameResult = await pool.query(usernameQuery);
        if (usernameResult.rows.length === 0) {
            throw new Error('User not found for userId: ' + userId);
        }
        const fetchedUsername = usernameResult.rows[0].username;

        // Check if the fetched username matches the provided username
        if (fetchedUsername !== username) {
            throw new Error('Provided username does not match the fetched username.');
        }

        // Query to update the user's password based on userId
        const query = {
            text: 'UPDATE "AccountCreation"."users" SET password = $1 WHERE id = $2',
            values: [hashedPassword, userId],
        };
        await pool.query(query);

        // Send success message to the user
        console.log('Password updated successfully for user:', fetchedUsername);
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
