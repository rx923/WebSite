const User = require('../models/userModel.js');

async function fetchUserProfile(username) {
    try {
        // Find the user based on the username
        const user = await User.findOne({ where: { username } });
        console.log(user);
        // Construct user information object
        const userInfo = {
            username: user.username,
            location: user.location,
            joined: user.createdAt,
            email: user.email
        };
        console.log(userInfo);

        return userInfo;
    } catch (error) {
        throw new Error('Error fetching user profile: ' + error.message);
    }
}



module.exports = { fetchUserProfile };
