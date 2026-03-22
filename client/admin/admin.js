/* js/admin.js */

// 1. Broadcast Global Alert
async function broadcastMsg() {
    const message = document.getElementById('admin-msg-input').value.trim();
    if (!message) return;

    try {
        await apiFetch('/admin/broadcast', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        document.getElementById('admin-msg-input').value = '';
        alert("BROADCAST SENT: All survivor tickers updated.");
    } catch (err) {
        alert("AUTHORIZATION ERROR: Admin credentials required.");
    }
}

// 2. Inject Threat Data
async function injectData() {
    const city = document.getElementById('admin-city').value;
    const intensity = parseFloat(document.getElementById('admin-intensity').value);

    try {
        await apiFetch('/heatmap/inject', {
            method: 'POST',
            body: JSON.stringify({ city, intensity })
        });

        updateAdminLog(city, intensity);
        alert(`THREAT UPDATED: ${city} set to ${intensity}`);
    } catch (err) {
        alert("INJECTION FAILED: Check server logs.");
    }
}

// 3. Update Local Admin Log
function updateAdminLog(city, intensity) {
    const log = document.getElementById('city-log');
    const now = new Date().toLocaleTimeString();
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="ts">[${now}]</span> <span class="loc">${city}</span> → <span class="val">${intensity.toFixed(2)}</span>`;
    
    log.insertBefore(entry, log.firstChild);
}