/* js/api.js */

async function apiFetch(endpoint, options = {}) {
    const token = sessionStorage.getItem(CONFIG.TOKEN_KEY); //
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}) //
    };

    const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    });

    if (response.status === 401) {
        // Token expired or invalid, redirect to login
        sessionStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    return response.json();
}