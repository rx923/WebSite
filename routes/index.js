const establishing_connection_routes = require('./establishing_connection_routes');
const server_authentication_routes = require('./server_authentication_routes');
const user_authentication_routes = require('./user_authentication_routes');
const express = require('express');
const router = express.Router();

// Importing other route files
// const userRoutes = require('./userRoutes');
// const authRoutes = require('./authRoutes');


// Correct usage of router.use() with router objects
router.use('/', establishing_connection_routes.router);
router.use('/auth/server', server_authentication_routes.router);
router.use('/auth/user', user_authentication_routes.router);


// Defining other routes
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', 'index.html'));
});

module.exports = {
    router,
    establishing_connection_routes,
    server_authentication_routes,
    user_authentication_routes
};
