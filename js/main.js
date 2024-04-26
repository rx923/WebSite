// Event listener for th elements
// Add click event listener to each div with class "th"
document.querySelectorAll('.th').forEach(function(th) {
  th.addEventListener('click', function() {
  // Find the first <a> element inside the clicked div and navigate to its href
  var link = this.querySelector('a');
  if (link) {
  window.location.href = link.href;
  }
  });
});

// Script for hiding all forms
// Function to hide all forms
function hideAllForms() {
  var forms = document.getElementsByClassName("form-container");
  for (var i = 0; i < forms.length; i++) {
    forms[i].style.display = "none";
  }
}


//Script for loading forms and handling a second side navigation opening
function toggleNav() {
  var sidenav = document.getElementById("mySidenav");
  var openText = document.getElementById("openText");
  var openTriangle = document.querySelector(".openTriangle");
  var main = document.getElementById("main");
  if (sidenav.classList.contains("sideNavOpen")) {
    sidenav.classList.remove("sideNavOpen");
    setTimeout(function () {
      openText.innerText = "";
      // right-pointing arrow
      openTriangle.innerHTML = "";
    }, 500);
    main.style.marginLeft = "0px";
  } else {
    sidenav.classList.add("sideNavOpen");
    setTimeout(function () {
      openText.innerText = "";
      // left-pointing arrow
      openTriangle.innerHTML = "";
    }, 500);
    // Adjust width if needed
    sidenav.style.width = "350px";
    openText.innerText = "";
    // Change this value if necessary
    // main.style.marginLeft = "250px";
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var sidenav = document.getElementById("mySidenav");
  var main = document.getElementById("main");
  var body = document.body;
  var closeButton = document.querySelector('.closebtn');

  sidenav.classList.remove("sideNavOpen");
  sidenav.style.width = "0";
  main.style.marginLeft = "0";
  body.style.backgroundColor = "white";

  closeButton.addEventListener('click', function () {
    closeNav();
  });

  body.addEventListener('click', function (event) {
    if (event.target !== sidenav && !sidenav.contains(event.target)) {
      closeNav();
    }
  });
});

function openNav() {
  var sidenav = document.getElementById("mySidenav");
  var openText = document.getElementById("openText");
  var openTriangle = document.querySelector(".openTriangle");
  sidenav.style.top = "30px";
  sidenav.style.borderRadius = "30px";
  sidenav.style.marginLeft = "30px";
  sidenav.style.bottom = "20vw";
  sidenav.style.height = "auto";
  sidenav.style.width = "350px";
  setTimeout(function () {
    openText.innerText = "close";
    // left-pointing arrow
    openTriangle.innerHTML = "";
  }, 500);

  openText.innerText = "";
  sidenav.classList.add("sideNavOpen");
  // Adjust margin if needed
  document.getElementById("main").style.marginLeft = "250px";
  document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function closeNav() {
  var sidenav = document.getElementById("mySidenav");
  var openTriangle = document.querySelector(".openTriangle");
  var main = document.getElementById("main");

  if (sidenav.classList.contains("sideNavOpen")) {
    // Close the navigation menu
    sidenav.style.width = "0px";
    // main.style.marginLeft = "0px";
    document.body.style.backgroundColor = "white";
    sidenav.classList.remove("sideNavOpen");
    // Right-pointing arrow
    openTriangle.innerHTML = "";

    // Reset to main triangle form after a delay
    setTimeout(function () {
    // Main triangle form
    openTriangle.innerHTML = "";
    }, 500);
  }
}
function loadForm(formURL, formId) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var content = document.getElementById("content");
        if (content) {
          content.innerHTML = this.responseText;
          var form = document.getElementById(formId);
          if (form) {
            form.classList.add("form-container-popup");
            form.style.minWidth = "220px";
            form.style.position = "absolute";
            form.style.top = "185px";
            form.style.right = "100px";
            // Apply transition effect to the form using CSS
            form.style.transition = "opacity 0.8s ease-in";
            // Set opacity to 0 initially to create a fade-in effect
            form.style.opacity = 0;
            // Trigger reflow to apply transition
            form.offsetHeight;
            // Set opacity to 1 to initiate the fade-in transition
            form.style.opacity = 1;
            closeNav();
            if (formURL.includes("Logare.html")) {
              // If it's the login form, add event listener to the forgot password link
              var forgotPasswordLink = document.getElementById("container_for_Cancel&Forgotten_Password");
              if (forgotPasswordLink) {
                forgotPasswordLink.addEventListener("click", loadForgotPasswordForm);
              } else {
                console.error("Forgot password link not found.");
              }
            }
          } else {
            console.error("Form element with id " + formId + " not found.");
          }
        } else {
          console.error("Content element not found.");
        }
      } else {
        console.error("Failed to load form. Status code: " + this.status);
      }
    }
  };
  xhttp.open("GET", formURL, true);
  xhttp.send();
}

function showForm(formId) {
  var forms = document.getElementsByClassName("form-container");
  for (var i = 0; i < forms.length; i++) {
    forms[i].style.display = "none";
  }
  var form = document.getElementById(formId);
  if (form) {
    form.style.display = "block";
    openNav();
  } else {
    console.error("Form element with id " + formId + " not found.");
  }
}

function closeForm() {
  var forms = document.getElementsByClassName("form-container");
  for (var i = 0; i < forms.length; i++) {
    forms[i].style.display = "none";
  }
}

function loadForgotPasswordForm() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var formContainer = document.getElementById("form-container-1");
      if (formContainer) {
        formContainer.innerHTML = this.responseText;
      } else {
        console.error("Form container element not found.");
      }
    }
  };
  xhttp.open("GET", "forgot-password.html", true);
  xhttp.send();
}




// Script for form related validation and different encoded paths

// Define URLs array
var urls = [
  'http://192.168.100.53:8081/WebSite/server/' + encodedPath,
];

// Function to fetch content from URLs
function fetchContent(urlIndex) {
  fetch(urls[urlIndex])
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(data => {
      // Update content element with fetched data
      var contentElement = document.getElementById("content");
      if (contentElement) {
        contentElement.innerHTML = data;
      } else {
        console.error('Content element not found.');
      }

      // Load additional resources (CSS and JS) if needed
      loadResourcesForPage(cssLinks);

      // Show form if formId is provided
      if (form) {
        var form = document.getElementById(form);
        if (form) {
          form.style.display = "block";
          form.style.width = "300px";
          form.style.height = "auto";
          form.style.position = "absolute";
          form.style.top = "50px";
          form.style.right = "50px";
        } else {
          console.error('Form element not found.');
        }
      }

      // Fetch CSS styles
      fetchCSS(cssLinks);
    })
    .catch(error => {
      console.error('Error:', error);

      // If fetching from the current URL fails, try the next one
      if (urlIndex < urls.length - 1) {
        fetchContent(urlIndex + 1);
      }
    });
}

// Function to fetch CSS styles
function fetchCSS(cssLinks) {
  cssLinks.forEach(link => {
    fetch(link)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(css => {
        var style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
      })
      .catch(error => {
        console.error('Error fetching CSS:', error);
      });
  });
}

// Start fetching content from the first URL
fetchContent(0);


function validateForm() {
  // Get form input values
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('psw');
  const confirmPasswordInput = document.getElementById('psw-repeat');

  // Check if form inputs are found
  if (!emailInput || !passwordInput || !confirmPasswordInput) {
    console.error('Form inputs not found.');
    return false;
  }

  // Get input values
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Introduceti o adresa de email valida');
    return false;
  }

  // Validate password length
  if (password.length < 6) {
    alert('Parola trebuie sa aiba cel putin 6 caractere');
    return false;
  }

  // Validate password match
  if (password !== confirmPassword) {
    alert('Parolele nu coincid');
    return false;
  }

  // Return true to submit the form if validation passes
  return true; 
}

// Function to adjust the size of canvas sections based on screen size
function adjustCanvasSections() {
  const canvasContainer = document.getElementById('Informatii-Aditionale-Template-Pentru-Linkuri');
  const leftCanvas = document.getElementById('leftCanvas');
  const rightCanvas = document.getElementById('rightCanvas');

  const containerWidth = canvasContainer.offsetWidth;

  leftCanvas.style.width = containerWidth / 2 + 'px';
  rightCanvas.style.width = containerWidth / 2 + 'px';
}

// Call the adjustCanvasSections function when the window is resized
window.addEventListener('resize', adjustCanvasSections);

// Call adjustCanvasSections initially to set sizes based on the initial window size
adjustCanvasSections();


let startY;

function applyUpDownEffect(startY, currentY) {
  const diffY = currentY - startY;

  if (diffY > 0) {
    document.body.style.transform = `translateY(${diffY}px)`;
  } else {
    document.body.style.transform = `translateY(${diffY}px)`;
  }
}

function resetTransform() {
  document.body.style.transform = 'translateY(0)';
}

document.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
  const currentY = e.touches[0].clientY;
  applyUpDownEffect(startY, currentY);
});

document.addEventListener('touchend', () => {
  resetTransform();
});