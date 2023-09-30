// Get a reference to the canvas element
var canvas = document.getElementById("bordered_rectangle-for-design");
var ctx = canvas.getContext("2d");

// Set the rectangle's position and dimensions
var x = 50; // X-coordinate
var y = 50; // Y-coordinate
var width = 200; // Width
var height = 100; // Height

// Set the border width and color
var borderWidth = 2;
var borderColor = "black";

// Clear the existing content inside the rectangle area
ctx.clearRect(x, y, width, height);

// Draw the border
ctx.strokeStyle = borderColor; // Set the border color
ctx.lineWidth = borderWidth; // Set the border width
ctx.strokeRect(x, y, width, height);
