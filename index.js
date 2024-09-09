document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('psw').value;

    try {
        const response = await fetch('/index/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            window.location.href = '/details.html'; // Redirect on successful login
        } else {
            const errorMessage = await response.text();
            document.getElementById('error-message').textContent = errorMessage;
        }
    } catch (err) {
        console.error('Login error:', err);
        document.getElementById('error-message').textContent = 'Failed to login';
    }
});
