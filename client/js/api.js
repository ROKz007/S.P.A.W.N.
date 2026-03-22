/* client/js/api.js */
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

        // Parse JSON regardless of status to get error messages or data
        const data = await response.json();

        if (response.status === 401) {
            sessionStorage.clear();
            if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                window.location.href = '/index.html';
            }
            throw new Error("Unauthorized");
        }

        if (!response.ok) throw new Error(data.error || "API Error");

        return data; // Return the parsed data
    } catch (err) {
        console.error("Fetch error:", err);
        throw err;
    }
}