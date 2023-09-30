// JavaScript to toggle the dropdown menu on button click
document.getElementById("myButton").addEventListener("click", function() {
    var dropdown = document.getElementById("myDropdown");
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
});
// Close the dropdown if the user clicks outside of it
window.addEventListener("click", function(event) {
    if (!event.target.matches("#myButton")) {
        var dropdown = document.getElementById("myDropdown");
        if (dropdown.style.display === "block") {
            dropdown.style.display = "none";
        }
    }
});