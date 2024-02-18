// hoverStyle.js
document.getElementById("index.html").innerHTML = ""
    document.addEventListener("DOMContentLoaded", function () {

     // Get all the <a> elements inside the <nav>
     const navLinks = document.querySelectorAll("nav a");

     // Add a hover effect to each <a> element
     navLinks.forEach((navLinks) => {
         navLinks.addEventListener("mouseenter", function() {
             navLinks.computedStyleMap.color="beige"; // Change the color on hover
         });

         navLinks.addEventListener("mouseleave", function() {
             navLinks.computedStyleMap.color=""; // Reset the color when not hovering
         });
     });
 });
// function on() {
//     document.getElementsByClassName("overlay").style.display = "block";
// }
  
// function off() {
//     document.getElementsByClassName("overlay").style.display = "none";
// }

