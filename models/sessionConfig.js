// File configured for handling the database session creation of the users connecting

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('../routes/db_config');
const ipRequests = new Map(); // Importing ipRequests for IP tracking

// Middleware for handling the database session creation of the users connecting
const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
        tableName: 'sessions'
    }),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
});


// Middleware function to track incoming requests, update IP counts, and block IPs
function trackAndBlockRequests(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Check if IP is blocked
    if (ipRequests.has(ip) && ipRequests.get(ip).count >= 100) {
        console.log(`Blocking IP ${ip} due to excessive requests.`);
        return res.status(429).send('Too Many Requests');
    }

    // Track the request by IP address
    if (ipRequests.has(ip)) {
        const { timestamp, count } = ipRequests.get(ip);
        if (now - timestamp <= 10000) { // Check if requests are within 10 seconds
            ipRequests.set(ip, { timestamp, count: count + 1 });
        } else {
            ipRequests.set(ip, { timestamp: now, count: 1 }); // Reset count after 10 seconds
        }
    } else {
        ipRequests.set(ip, { timestamp: now, count: 1 });
    }

    // Log incoming requests along with IP addresses
    console.log(`Incoming request from IP: ${ip}`);

    next();
}

// Export sessionMiddleware with IP tracking middleware included
module.exports = { sessionMiddleware, trackAndBlockRequests };
