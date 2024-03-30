const { hashPassword } = require("../controllers/auth");

resetPassword: async(req, res) => {
    try {
        // Retreive user details from database
        const userId = req.session.user_id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const newPassword = req.body.newPassword;
        if (!newPassword || newPassword.length < 6 || newPassword.length > 20) {
            return res.status(400).json({ error: 'Invalid new password. Password must be between 6 and 20 characters.' });
        }

        const hashedPassword = await hashPassword(newPassword);

        user.password = hashedPassword;
        await user.save();

        // Invalidating the existing session for forcing the user to log in again with the new password.

        return res.status(200).json({ message: 'Password updated succesfully' });
    } catch(error) {
        console.error('Error resetting password: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

}

module.exports = { resetPassword }