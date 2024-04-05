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
          text: 'SELECT password FROM users WHERE id = $1',
          values: [userId],
      };

      const result = await pool.query(query);
      if (result.rows.length === 0) {
          throw new Error('User not found');
      }

      // Assuming the password is stored in the 'password' column
      console.log('Current password:', result.rows[0].password);
      return result.rows[0].password;
  } catch (error) {
      console.error('Error fetching current password:', error);
      throw new Error('Failed to fetch current password.');
  }
}

// Function to update the password in the database
async function updatePassword(userId, newPassword) {
  try {
      // Hash the new password before updating it in the database
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Query to update the user's password based on userId
      for (let i = 0; i < userId.length; i++) {
          const query = {
              text: 'UPDATE users SET password = $1 WHERE id = $2',
              values: [hashedPassword, userId[i]],
          };
          await pool.query(query);
      }

      // Send success message to the user
      const successMessage = 'Password has been successfully reset.';
      console.log(successMessage);
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
