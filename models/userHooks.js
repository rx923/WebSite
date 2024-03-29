const bcrypt = require('bcryptjs');
const { saltRounds } = require('../config/constants');

const addPasswordHashHook = (User) => {
    User.addHook('beforeCreate', async (user) => {
        user.password = await bcrypt.hash(user.password, saltRounds);
    });
};

module.exports = { addPasswordHashHook };
