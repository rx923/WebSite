const { DataTypes, Sequelize } = require('sequelize');


const sequelize  = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || '192.168.100.53',
    database: process.env.DB_NAME || 'AccountCreation',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'MainAdministrator',
    port: process.env.DB_PORT || '5432'
});

const Session = sequelize.define('Session', {
    sid: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    sess: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
}, {
    tableName: 'sessions',
    timestamps: true // Set timestamps to false to exclude createdAt and updatedAt fields
});
module.exports = {sequelize, Session};