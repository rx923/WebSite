const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./models/users.js');

const User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
});

(async () => {
    try {
        await sequelize.authenticate();
        const tableExists = await sequelize.getQueryInterface().showAllTables();
        if (!tableExists.includes('User')) {
            await User.sync({ force: true });
            console.log('User table created successfully');
        } else {
            console.log('User table already exists');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

const createUser = async () => {
    try {
        const newUser = await User.create({
            username: 'example',
            email: 'example@example.com',
            password: 'examplepassword'
        });
        console.log('New user created:', newUser);
    } catch (error) {
        console.error('Error creating user:', error);
    }
};

module.exports = { User, createUser };
