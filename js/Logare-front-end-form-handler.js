const rememberCheckbox = document.getElementById('remember');


document.getElementById('Logheaza-teForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            console.error('Failed to log in.');
            // Handle any other errors or display a generic error message
            return;
        } else {
            // Redirect to logged_in.html upon successful login
            window.location.href = '/Account.html';
            console.log('Redirecting to Account.html');
        }
    } catch (error) {
        console.error(error.message);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to log in.');
        }

        const data = await response.json();
        console.log('User logged in successfully:', data);

        // Check if the "Remember Me" checkbox is checked
        if (rememberCheckbox.checked) {
            // Store authentication token or other relevant data in local storage or cookies
            localStorage.setItem('authToken', data.token); // Example: Storing the authentication token in local storage
        } else {
            // Clear any stored authentication data if "Remember Me" is not checked
            localStorage.removeItem('authToken');
        }

        // Redirect to the dashboard or home page
        window.location.href = '/dashboard.html'; // Example: Redirecting to the dashboard page
    } catch (error) {
        console.error(error.message);
        // Handle login error
    }
});