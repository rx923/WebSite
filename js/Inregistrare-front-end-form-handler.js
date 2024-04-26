document.getElementById('InregistrareForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            }),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const data = await response.json();
        console.log('User registered successfully:', data);

        // Redirect to the login page after a delay (if needed)
        setTimeout(() => {
            window.location.href = '/Logare.html';
        }, 3000); // Redirect after 3 seconds (adjust as needed)

    } catch (error) {
        console.error('Registration error:', error);
        // Handle registration error
    }
});
