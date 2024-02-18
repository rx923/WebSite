// Get all dropdown from the document

const dropdown = document.querySelectorAll('.dropdown');

//Loop through all dropdown elements
dropdown.array.forEach(dropdown => {
    //Get inner elements from each dropdown
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu');
    const options = dropdown.querySelector('.menu li');
    const selected = dropdown.querySelector('.selected');
});

// Using this method in order to  have multiple dropdown menus on the page work

//Add a click event to the select element
select.addEventListener('click', () => {
    //Add the clicked select styles to the select element
    select.classList.toggle('select-clicked');
    //Add the rotate styles to the care element
    caret.classList.toggle('caret-rotate');
    //Add the open styles to the menu element
    menu.classList.toggle('menu-open');
});

//Loop through all dropdown elements
options.forEach(dropdown => {
    //Add a click event to t he option element
    dropdown.addEventListener('click', () => {
        //Change selected inner text to clicked dropdown inner text
    });
});