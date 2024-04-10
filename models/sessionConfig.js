// File configured for handling the database session creation of the users connecting

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('../routes/db_config');
// const { generateRandomSecret } = require('../routes/db_config.js');

const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
        tableName: 'sessions'
    }),
    // secret: generateRandomSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
});

module.exports = sessionMiddleware;