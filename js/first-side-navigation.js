
// Script for first sidenavigation
function toggleMenu() {
var menu = document.getElementById('menu');

if (menu.style.left === '-470px') {
    // if menu is closed, open it
    menu.style.left = '0px';
} else {
    // if menu is open, close it
    menu.style.left = '-470px';
}
}

function openMenu() {
var menu = document.getElementById('menu');

if (menu) {
    menu.classList.add('open');
} else {
    console.error("Menu element not found.");
}
}

function closeMenu() {
var menu = document.getElementById('menu');
if (menu) {
    menu.style.left = '-470px';
} else {
    console.error("Menu element not found.");
}
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
// Event listener for opening the menu
document.getElementById('openMenuBtn').addEventListener('click', openMenu);

// Event listener for closing the menu
document.getElementById('closeMenuBtn').addEventListener('click', closeMenu);
});
