const express = require("express");
// Importing the cors module
const cors = require("cors"); 
const app = express();

// Middleware
// Applying CORS middleware
app.use(cors());
app.use(express.static('public')); 
app.use(express.json());

app.listen(8080, () => {
    console.log("Server started on port 8080");
});
