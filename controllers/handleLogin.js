// Import your login function from login.js
const login = require('../controllers/login'); 

const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await login(username, password);
        if (result.success) {
            // Create a new session for the user
            req.session.user = { username }; 
            res.status(200).json({ message: "Login successful." });
            // Set session start time
            req.session.startTime = Date.now();
        } else {
            res.status(401).json({ message: result.message });
        }
    } catch (error) {
        console.error('Error handling login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = handleLogin;