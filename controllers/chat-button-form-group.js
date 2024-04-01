const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Parsing incoming bodies in a middleware before your handlers, available under the req.body property
app.use(bodyParser.urleconded({ extended: false }));

// Handle POST request to /send-message
app.post('/send-message', (req, res) => {
    const message = req.body.message;
    // Processing the message of the user
    console.log('Received message:', message);

    res.send('Message sent successfully!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
