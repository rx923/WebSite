const { login, logout, register } = require('../controllers/auth');


// Function to handle user registration
exports.register = async (req, res) => {
    try {
        // Registration logic goes here
        // Example: Fetch data from request body, validate inputs, save user to database, etc.
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};



module.exports ={ register };
