/* js/api.js */
async function apiFetch(endpoint, options = {}) {
    const token = sessionStorage.getItem(CONFIG.TOKEN_KEY);
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    try {
        const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
            ...options,
            headers: { ...defaultHeaders, ...options.headers }
        });

        if (response.status === 401) {
            sessionStorage.clear();
            // Only redirect if NOT already on index.html to prevent loops
            if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                window.location.href = 'index.html';
            }
            throw new Error("Unauthorized");
        }

        return response.json();
    } catch (err) {
        console.error("Fetch error:", err);
        throw err;
    }
}