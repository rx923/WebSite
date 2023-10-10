const express = require("express");
const app = express();
const app = require ("cors");

//middleware
app.use(cors());
app.use(express.json());


app.listen(5432, () => {
    console.log("server started on port 5432");
});

