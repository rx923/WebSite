const express = require("express");
// Importing the cors module
const cors = require("cors"); 
const app = express();

// Middleware
// Applying CORS middleware
app.use(cors());
app.use(express.static('public')); 
app.use(express.json());



// Defining a route to serve the Logare.html file:
app.get('\\Logare', (req, res) =>{
    res.sendFile('U:\\Plan Afacere\\WebSite\\ComputerLaptop WebSite\\Inregistrare&Logare_user\\Inregistrare.html', {root: --__dirname});
});




//Enabling application to listen on port 8080
app.listen(8080, () => {
    console.log("Server started on port 8080");
});
