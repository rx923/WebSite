const express = require('express');
const cors = require("cors");
const path = require('path');
const { User, createUser } = require('./public/models/users');
var http = require('http')
const HOST = '192.168.100.53';
const PORT = process.env.PORT || 8081;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', 'css')));
app.use(express.static(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public')));


app.get('/InregistrareForm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inregistrare.html'));
});

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, './index.html'));
});


//Defining a route towards Meniu_Produse_1.html page
app.get('http://192.168.100.53:8081/WebSite/public/Meniu_Produse_1.html', (req, res) =>{
    const requestedPath = req.url;
    const filePath = path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', requestedPath);
    res.sendFile(path.join(__dirname, 'Plan_Afacere', 'WebSite', 'public', 'Meniu_Produse_1.html'), filePath);

});




app.post('/InregistrareForm', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await User.create({ username, email, password });
        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server is listening on ${HOST}:${PORT}`);
    createUser();
});
