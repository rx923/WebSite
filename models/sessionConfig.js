const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./sessionModel');

const sessionMiddleware = session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
        db: sequelize,
        tableName: 'sessions'
    })
});

module.exports = sessionMiddleware;
