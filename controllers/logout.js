// Import the Session model
const Session = require('../models/sessionModel.js'); 

// Define a function to handle logout and clear session from the database
async function handleLogout(req, res) {
    try {
        // Check if the user session exists and is active
        if (req.session && req.session.user_id) {
            // Destroy session
            req.session.destroy();

            // Clear session from the database
            await clearSessionFromDatabase(req.sessionID);

            console.log('User logged out successfully.');
            return res.redirect('/index.html');
        } else {
            console.error('User session not found or inactive.');
            return res.status(400).json({ error: 'User session not found or inactive.' });
        }
    } catch (error) {
        console.error('Error logging out:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Function to clear session from the database
async function clearSessionFromDatabase(sessionId, userId) {
    try {
        // Find the session in the database corresponding to the user
        const session = await Session.findOne({ where: { sid: sessionId, user_id: userId } });
        
        // If session exists, delete it from the database
        if (session) {
            await session.destroy();
            console.log('Session cleared from the database:', sessionId);
        } else {
            console.log('Session not found in the database or does not belong to the user:', sessionId);
        }
    } catch (error) {
        console.error('Error clearing session from database:', error);
        throw error;
    }
}

module.exports = { handleLogout, clearSessionFromDatabase };
