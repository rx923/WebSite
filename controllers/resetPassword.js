const { hashPassword } = require("../controllers/auth");
const { User } = require("../models/userModel.js"); // Import the User model
const { getCurrentPassword, updatePassword } = require("../routes/passwordService");




const resetPassword = async (req, res) => {
    try {
        // Retrieve user details from the request
        const username = req.body.username; // Assuming the username is sent in the request body

        // Check if username is provided
        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }

        // Fetch user based on username
        const user = await User.findByUsername(username);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if current password is provided
        const currentPassword = req.body.currentPassword;
        if (!currentPassword) {
            return res.status(400).json({ error: 'Current password is required.' });
        }

        // Fetch current password from the database based on user's username
        const storedPassword = await getCurrentPassword(username);

        // Compare current password with the one stored in the database
        const isMatch = await bcrypt.compare(currentPassword, storedPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password.' });
        }

        // Validate and hash the new password
        const newPassword = req.body.newPassword;
        if (!newPassword || newPassword.length < 6 || newPassword.length > 20) {
            return res.status(400).json({ error: 'Invalid new password. Password must be between 6 and 20 characters.' });
        }
        const hashedPassword = await hashPassword(newPassword);

        // Update user's password in the database
        await updatePassword(username, hashedPassword);

        // Optionally, invalidate existing session by clearing session data
        // This assumes that you are using sessions to manage user authentication
        req.session.destroy();

        return res.status(200).json({ message: 'Password updated successfully. Please log in again.' });
    } catch (error) {
        console.error('Error resetting password: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = { resetPassword }