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

    // Fetch SOS history
    try {
        const history = await apiFetch('/sos/history');
        renderSosHistory(history || []);
    } catch (e) {
        console.info('No SOS history available:', e);
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
    const alertBar = document.getElementById('alert-bar');
    const display = document.getElementById('admin-msg-display');
    if (adminMessage && alertBar && display) {
        alertBar.style.display = 'block';
        display.textContent = adminMessage;
    }
}

function checkSOS() {
    try {
        const raw = localStorage.getItem('lastSOS');
        if (!raw) return;
        const sos = JSON.parse(raw);
        if (!sos) return;

        // Create or update a persistent banner at top of dashboard
        let banner = document.getElementById('sos-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'sos-banner';
            banner.style.cssText = 'background:linear-gradient(90deg,var(--rust),var(--rust-bright));color:#fff;padding:12px;border-radius:8px;margin-bottom:12px;font-family:Share Tech Mono,monospace;';
            const container = document.querySelector('main.panel') || document.body;
            container.insertBefore(banner, container.firstChild);
        }

        const time = new Date(sos.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        banner.textContent = `🚨 SOS: ${sos.user} — ${sos.city} @ ${time} — ${sos.message || ''}`;

    } catch (e) { console.error('checkSOS error', e); }
}

function renderSosHistory(items) {
    const el = document.getElementById('sos-history');
    if (!el) return;
    if (!items || !items.length) {
        el.innerHTML = '<div style="padding:8px;color:var(--text-dim);">No SOS events recorded.</div>';
        return;
    }

    el.innerHTML = items.slice(0,50).map(it => {
        const t = it.time ? new Date(it.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : (it.created_at ? new Date(it.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-');
        return `<div style="padding:6px;border-bottom:1px solid rgba(255,255,255,0.02)"><strong style="color:var(--rust)">${it.user}</strong> — <span style="color:var(--text)">${it.city}</span> <span style="float:right;color:var(--text-dim)">${t}</span><div style="clear:both;color:var(--text-dim);font-size:11px;margin-top:6px">${it.message||''}</div></div>`;
    }).join('');
}
// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    checkSOS();
    // also refresh SOS banner occasionally
    setInterval(checkSOS, 30000);
    // check for admin broadcasts too
    checkAdminMessages();
    setInterval(checkAdminMessages, 10000);
});