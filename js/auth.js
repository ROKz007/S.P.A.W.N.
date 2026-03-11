/* js/auth.js */

// 1. Toggle between Login and Signup forms
function switchAuth(tab) {
    const loginForm = document.getElementById('auth-form-login');
    const signupForm = document.getElementById('auth-form-signup');
    const tabs = document.querySelectorAll('.auth-tab');

    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    if (tab === 'login') {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
    }
}

// 2. Handle Login
async function doLogin() {
    const callsign = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    try {
        const response = await fetch(`${CONFIG.API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callsign, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user data
            sessionStorage.setItem(CONFIG.TOKEN_KEY, data.token);
            sessionStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
            loginSuccess(data.user);
        } else {
            showAuthError(data.error || 'Login failed');
        }
    } catch (err) {
        showAuthError('Connection to network lost.');
    }
}

// 3. Handle Enlistment (Signup)
async function doSignup() {
    const callsign = document.getElementById('signup-user').value;
    const password = document.getElementById('signup-pass').value;
    const region = document.getElementById('signup-region').value;

    try {
        const response = await fetch(`${CONFIG.API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callsign, password, region })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem(CONFIG.TOKEN_KEY, data.token);
            sessionStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
            loginSuccess(data.user);
        } else {
            showAuthError(data.error || 'Signup failed');
        }
    } catch (err) {
        showAuthError('Unable to reach Command Center.');
    }
}

function loginSuccess(user) {
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('nav-user').textContent = user.callsign;
    // Notify the user via the custom toast system
    if (typeof showToast === 'function') showToast(`WELCOME, ${user.callsign.toUpperCase()}`);
}

function showAuthError(msg) {
    const errEl = document.getElementById('auth-err');
    errEl.textContent = `⚠ ${msg.toUpperCase()}`;
}