const express = require('express');
const cors = require("cors");
const path = require('path');
const { createUser } = require('./public/routes/creation_of_user_accounts');


const HOST = '192.168.100.53';
const PORT = process.env.PORT || 8081;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', 'css')));
app.use(express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public')));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, './index.html'));
});

app.post('/Inregistrare.html', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Use the createUser function to create a new user
        const newUser = await createUser(username, email, password); 
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server is listening on ${HOST}:${PORT}`);
});
