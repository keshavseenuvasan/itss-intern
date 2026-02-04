// Authentication Logic

/**
 * Handle login form submission
 */
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('errorMessage');

  errorDiv.style.display = 'none';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);

      // Redirect to dashboard
      window.location.href = '/dashboard.html';
    } else {
      errorDiv.textContent = data.error || 'Login failed';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'An error occurred. Please try again.';
    errorDiv.style.display = 'block';
    console.error('Login error:', err);
  }
});

/**
 * Check if user is authenticated when accessing login page
 */
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    const token = localStorage.getItem('token');
    if (token) {
      // User already logged in, redirect to dashboard
      window.location.href = '/dashboard.html';
    }
  }
});
