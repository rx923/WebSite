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
// Function to update the password in the database
async function updatePassword(email, newPassword, res) {
    try {
        // Check if the new password meets the required criteria
        if (!isValidPassword(newPassword)) {
            // If the password is invalid, render the error page
            return res.render('password_reset_error', { message: 'Invalid password. Please provide a password between 6 and 30 characters long, containing at least one letter, one number, and one special character.' });
        }
        
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
        return res.render('password_reset_success', { message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error updating password:', error);
        // Handle the error and render an error page
        return res.render('password_reset_error', { message: 'An error occurred while updating the password. Please try again later.' });
    }
}

// Function to validate password requirements
function isValidPassword(password) {
    // Constants for password constraints
    const minLength = 6;
    const maxLength = 30;
    const containsLetter = /[a-zA-Z]/.test(password);
    const containsNumber = /[0-9]/.test(password);
    const containsSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Check if password meets all criteria
    if (
        password.length >= minLength &&
        password.length <= maxLength &&
        containsLetter &&
        containsNumber &&
        containsSpecialChar
    ) {
        return true;
    }
    
    // Prepare error message
    let errorMessage = 'Password must ';
    if (password.length < minLength) {
        errorMessage += 'be at least ' + minLength + ' characters long, ';
    }
    if (password.length > maxLength) {
        errorMessage += 'be at most ' + maxLength + ' characters long, ';
    }
    if (!containsLetter) {
        errorMessage += 'contain at least one letter, ';
    }
    if (!containsNumber) {
        errorMessage += 'contain at least one number, ';
    }
    if (!containsSpecialChar) {
        errorMessage += 'and contain at least one special character, ';
    }
    // Remove the trailing comma and space
    errorMessage = errorMessage.slice(0, -2);
    
    return errorMessage;
}


// Function to generate a random password
async function generateRandomPasswordAndUpdate(email, res) {
    try {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        const maxLength = 20;
        for (let i = 0; i < maxLength; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        
        // Hash the new password before updating it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Query to update the user's password based on the provided email
        const query = {
            text: 'UPDATE users SET password = $1 WHERE email = $2',
            values: [hashedPassword, email],
        };
        await pool.query(query);

        // Send success message to the user
        console.log('Password updated successfully for user with provided email:', email);
        return password;
    } catch (error) {
        console.error('Error generating and updating password:', error);
        // Handle the error
        throw new Error('An error occurred while generating and updating the password.');
    }
}

module.exports = { getCurrentPassword, updatePassword, generateRandomPasswordAndUpdate };