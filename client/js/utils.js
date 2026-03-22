/* js/utils.js */

/**
 * Shows a temporary notification toast at the bottom right.
 * Matches the 'rust-bright' aesthetic of S.P.A.W.N.
 */
function showToast(msg, duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = `// ${msg.toUpperCase()}`; // Terminal style
    
    document.body.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, duration);
}

/**
 * Formats ISO strings into readable HH:MM terminal time.
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Truncates long strings for trade cards or logs.
 */
function truncate(str, len = 80) {
    return str.length > len ? str.slice(0, len) + '...' : str;
}

// Global Uptime Counter
function initUptime(startTime) {
    const uptimeEl = document.getElementById('uptime-display');
    if (!uptimeEl) return;

    setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        uptimeEl.textContent = `${h}:${m}:${s}`;
    }, 1000);
}