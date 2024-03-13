const bcrypt = require('bcryptjs');
const { generateRandomSecret } = require('./loggedin');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('../routes/db_config');
const express = require('express');
// const { response } = require('../server.js');
const crypto = require('crypto');
const router = express.Router();
const { User } = require('../models/userModel.js');
// Configure session

const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
        tablename: 'sessions'
    }),
    // Use randomly generated secret
    secret: generateRandomSecret(),
    resave: false,
    saveUninitialized: true,
    // Session duration: 10 minutes (in milliseconds)
    cookie: { secure: false }
});

// Add session middleware to router
router.use(sessionMiddleware);

module.exports = { sessionMiddleware };