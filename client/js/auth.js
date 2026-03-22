/* js/auth.js */

/**
 * 1. INITIALIZATION & UI INJECTION
 * Handles the boot sequence and builds the Auth UI dynamically.
 */
function initAuth() {
    const authForm = document.getElementById('auth-form');
    if (!authForm) return;

    // Inject the terminal-style UI
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

    // Sequence: Boot Animation -> Check Token -> Show App or Auth
    setTimeout(() => {
        const token = sessionStorage.getItem(CONFIG.TOKEN_KEY);
        const bootScreen = document.getElementById('boot-screen');
        const authOverlay = document.getElementById('auth-overlay');
        const app = document.getElementById('app');

        if (bootScreen) bootScreen.style.display = 'none';

        if (token) {
            app.style.display = 'block';
            const user = JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY));
            document.getElementById('nav-user').textContent = user.callsign;
        } else {
            if (authOverlay) authOverlay.style.display = 'flex';
        }
    }, 2500);
}

/**
 * 2. FORM INTERACTION
 */
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

/**
 * 3. AUTHENTICATION LOGIC
 */
async function doLogin() {
    const callsign = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ callsign, password })
        });

        sessionStorage.setItem(CONFIG.TOKEN_KEY, data.token);
        sessionStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
        loginSuccess(data.user);
    } catch (err) {
        showAuthError(err.message || 'Login failed');
    }
}

async function doSignup() {
    const callsign = document.getElementById('signup-user').value;
    const password = document.getElementById('signup-pass').value;
    const region = document.getElementById('signup-region').value;

    try {
        const data = await apiFetch('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ callsign, password, region })
        });

        sessionStorage.setItem(CONFIG.TOKEN_KEY, data.token);
        sessionStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
        loginSuccess(data.user);
    } catch (err) {
        showAuthError(err.message || 'Signup failed');
    }
}

function loginSuccess(user) {
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('nav-user').textContent = user.callsign;
    if (typeof showToast === 'function') showToast(`WELCOME, ${user.callsign.toUpperCase()}`);
}

function showAuthError(msg) {
    const errEl = document.getElementById('auth-err');
    if (errEl) errEl.textContent = `⚠ ${msg.toUpperCase()}`;
}

// Run on load
document.addEventListener('DOMContentLoaded', initAuth);