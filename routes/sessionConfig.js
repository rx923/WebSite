const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('../routes/db_config');
// Require the crypto module
const { secretKey } = require('../controllers/loggedin.js');

// Initialize the session store
const sessionStore = new pgSession({
    pool: pool,
    tableName: 'sessions'
});

const configureSession = (app) => {
    return session({
        store: sessionStore,
        // Use randomly generated secret
        secret: secretKey,
        resave: false,
        saveUninitialized: true,
        // Session duration: 10 minutes (in milliseconds)
        cookie: { secure: false }
    });
};



module.exports = { configureSession, sessionStore };
