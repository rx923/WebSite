const express = require("express");
// Importing the cors module
const cors = require("cors"); 
const app = express();

// Middleware
// Applying CORS middleware
app.use(cors()); 
app.use(express.json());

app.listen(5432, () => {
    console.log("Server started on port 5432");
});
