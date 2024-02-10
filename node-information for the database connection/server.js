const { Client } = require('pg');

// Setting up the connection parameters
const client = new Client({
    user: 'postgres',
    host: '192.168.100.53',
    database: 'postgres', // Adjusted database name
    password: 'MainAdministrator',
    port: 5432,
});

// Connect to the PostgreSQL server
client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
        // You can perform database operations here

        // End the connection
        client.end()
            .then(() => {
                console.log('Connection to PostgreSQL database ended');
            })
            .catch(err => {
                console.error('Error ending connection to PostgreSQL:', err);
            });
    })
    .catch(err => {
        console.error('Error connecting to PostgreSQL:', err);
    });
