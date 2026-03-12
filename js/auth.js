/* js/auth.js */
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem(CONFIG.TOKEN_KEY);
    const bootScreen = document.getElementById('boot-screen');
    const authOverlay = document.getElementById('auth-overlay');
    const app = document.getElementById('app');

    // Simulate boot delay then check auth
    setTimeout(() => {
        bootScreen.style.display = 'none';
        if (token) {
            app.style.display = 'block';
            const user = JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY));
            document.getElementById('nav-user').textContent = user.callsign;
        } else {
            authOverlay.style.display = 'block';
            // Trigger your form generation logic here if #auth-form is empty
        }
    }, 2000); 
});
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
/* js/auth.js - Add this at the bottom */

function initAuth() {
    const authForm = document.getElementById('auth-form');
    if (!authForm) return;

    // Inject the Login/Signup UI structure
    authForm.innerHTML = `
        <div class="auth-tabs">
            <button class="auth-tab active" onclick="switchAuth('login')">LOGIN</button>
            <button class="auth-tab" onclick="switchAuth('signup')">ENLIST</button>
        </div>
        
        <div id="auth-form-login" class="auth-fields">
            <input type="text" id="login-user" class="auth-input" placeholder="CALLSIGN">
            <input type="password" id="login-pass" class="auth-input" placeholder="PASSCODE">
            <button class="spawn-btn" onclick="doLogin()">AUTHENTICATE ›</button>
        </div>

        <div id="auth-form-signup" class="auth-fields" style="display:none">
            <input type="text" id="signup-user" class="auth-input" placeholder="NEW CALLSIGN">
            <input type="password" id="signup-pass" class="auth-input" placeholder="SET PASSCODE">
            <select id="signup-region" class="auth-input">
                <option value="Bhubaneswar">Sector: Bhubaneswar</option>
                <option value="Cuttack">Sector: Cuttack</option>
                <option value="Rourkela">Sector: Rourkela</option>
            </select>
            <button class="spawn-btn" onclick="doSignup()">ENLIST NOW ›</button>
        </div>
        <div id="auth-err" class="auth-error"></div>
    `;

    // Make the overlay visible after the boot animation
    setTimeout(() => {
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('auth-overlay').style.display = 'flex';
    }, 2500); // Matches your boot-up sequence timing
}

// Execute when DOM is ready
document.addEventListener('DOMContentLoaded', initAuth);

/* js/auth.js */

// ... keep your existing switchAuth, doLogin, and doSignup functions ...

function initAuth() {
    const authForm = document.getElementById('auth-form');
    if (!authForm) return;

    // Injecting the terminal-style UI into the empty container
    authForm.innerHTML = `
        <div class="auth-tabs">
            <button class="auth-tab active" onclick="switchAuth('login')">LOGIN</button>
            <button class="auth-tab" onclick="switchAuth('signup')">ENLIST</button>
        </div>
        
        <div id="auth-form-login" class="auth-fields" style="display: flex; flex-direction: column; gap: 10px;">
            <input type="text" id="login-user" class="auth-input" placeholder="CALLSIGN">
            <input type="password" id="login-pass" class="auth-input" placeholder="PASSCODE">
            <button class="spawn-btn" onclick="doLogin()">AUTHENTICATE ›</button>
        </div>

        <div id="auth-form-signup" class="auth-fields" style="display:none; flex-direction: column; gap: 10px;">
            <input type="text" id="signup-user" class="auth-input" placeholder="NEW CALLSIGN">
            <input type="password" id="signup-pass" class="auth-input" placeholder="SET PASSCODE">
            <select id="signup-region" class="auth-input" style="background: var(--dark); color: var(--text);">
                <option value="Bhubaneswar">Sector: Bhubaneswar</option>
                <option value="Cuttack">Sector: Cuttack</option>
                <option value="Rourkela">Sector: Rourkela</option>
            </select>
            <button class="spawn-btn" onclick="doSignup()">ENLIST NOW ›</button>
        </div>
        <div id="auth-err" style="color: var(--rust-bright); font-size: 10px; margin-top: 10px; text-align: center;"></div>
    `;

    // Transition from boot screen to auth overlay
    setTimeout(() => {
        const bootScreen = document.getElementById('boot-screen');
        const authOverlay = document.getElementById('auth-overlay');
        
        if (bootScreen) bootScreen.style.display = 'none';
        if (authOverlay) authOverlay.style.display = 'flex'; // Uses flex to center the auth-box
    }, 2500);
}

// Ensure the function runs when the page is ready
document.addEventListener('DOMContentLoaded', initAuth);