/* js/dashboard.js */

async function loadDashboardData() {
    try {
        // 1. Fetch Admin Stats (Survivors & Active Trades)
        const stats = await apiFetch('/admin/stats'); 
        document.getElementById('qs-survivors').textContent = stats.survivorsOnline || 0;
        document.getElementById('qs-trades').textContent = stats.activeTrades || 0;

        // 2. Fetch Heatmap Data for Threat Bars
        const heatmapData = await apiFetch('/heatmap');
        renderThreatBars(heatmapData);
    } catch (err) {
        console.error("Dashboard sync failed:", err);
    }
}

function renderThreatBars(data) {
    const container = document.getElementById('threat-display');
    if (!container) return;

    // Sort regions by highest intensity first
    const sortedData = data.sort((a, b) => b.intensity - a.intensity).slice(0, 6);

    container.innerHTML = sortedData.map(region => {
        const intensityPct = Math.round(region.intensity * 100);
        let levelClass = 'low';
        
        if (region.intensity >= 0.7) levelClass = 'high';
        else if (region.intensity >= 0.3) levelClass = 'mid';

        return `
            <div class="threat-label">
                <span>${region.city.toUpperCase()}</span>
                <span>${intensityPct}%</span>
            </div>
            <div class="threat-bar">
                <div class="threat-fill ${levelClass}" style="width: ${intensityPct}%"></div>
            </div>
        `;
    }).join('');
}


function checkAdminMessages() {
    const adminMessage = localStorage.getItem('adminMessage');
    const displayBox = document.getElementById('adminMessageBox');
    const content = document.getElementById('adminMessageContent');

    if (adminMessage && displayBox && content) {
        displayBox.style.display = 'block';
        content.textContent = adminMessage;
    }
}
// Initialize on load
document.addEventListener('DOMContentLoaded', loadDashboardData);