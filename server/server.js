//This is the express server for serving the files.

const express = require('express');
const path = require('path')
const app = express();

// Defining the routes


const PORT = process.env.PORT || 8081;
const HOST = '192.168.100.53';

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(PORT, HOST, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});

