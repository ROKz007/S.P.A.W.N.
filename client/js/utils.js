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

// Nav profile dropdown: toggle menu, handle actions
function initNavProfile() {
    const btn = document.getElementById('nav-user-btn') || document.getElementById('nav-user');
    const menu = document.getElementById('nav-user-menu');
    if (!btn || !menu) return;

    // Default display
    try {
        const userStr = sessionStorage.getItem(CONFIG.USER_KEY);
        if (userStr) {
            const u = JSON.parse(userStr);
            btn.textContent = u?.callsign || 'UNAUTH';
        }
    } catch (e) {}

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
    });

    document.addEventListener('click', () => menu.classList.remove('open'));

    menu.querySelectorAll('button[data-action]').forEach(item => {
        item.addEventListener('click', async (ev) => {
            ev.stopPropagation();
            const action = item.getAttribute('data-action');
            menu.classList.remove('open');
            if (action === 'logout') {
                sessionStorage.clear();
                window.location.href = '/index.html';
            } else if (action === 'my-trades') {
                window.location.href = '/trade/trade.html?mine=1';
            } else if (action === 'change-location') {
                await promptChangeLocation();
            }
        });
    });
}

async function promptChangeLocation() {
    try {
        const res = await apiFetch('/heatmap');
        const cities = Array.from(new Set((res || []).map(p => p.city))).filter(Boolean).sort();
        if (!cities.length) {
            if (typeof showToast === 'function') showToast('No cities available', 3000);
            return;
        }
        const current = (() => { try { return JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY) || '{}').region; } catch (e) { return null; }})();
        const choice = prompt('Update your location (type city name):\n' + cities.join(', '), current || cities[0]);
        if (!choice) return;
        const picked = cities.find(c => c.toLowerCase() === choice.toLowerCase());
        if (!picked) {
            if (typeof showToast === 'function') showToast('City not in list', 3000);
            return;
        }
        try {
            const userObj = JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY) || '{}');
            userObj.region = picked;
            sessionStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userObj));
            if (typeof showToast === 'function') showToast(`Location set to ${picked}`, 3000);
        } catch (e) {}
    } catch (e) {
        if (typeof showToast === 'function') showToast('Could not load cities', 3000);
    }
}

document.addEventListener('DOMContentLoaded', initNavProfile);

/**
 * Enforce admin-only visibility for admin navigation and pages.
 * Hides any links to /admin/admin.html for non-admin users and
 * prevents non-admins from interacting with admin UI if they land there.
 */
function enforceAdminVisibility() {
    try {
        const userStr = sessionStorage.getItem(CONFIG.USER_KEY);
        const user = userStr ? JSON.parse(userStr) : null;
        const isAdmin = user && user.role === 'admin';

        // Hide admin nav links for non-admins
        document.querySelectorAll('a[href$="/admin/admin.html"]').forEach(a => {
            a.style.display = isAdmin ? '' : 'none';
        });

        // If on admin page, block UI for non-admins
        const path = window.location.pathname || '';
        if (path.toLowerCase().endsWith('/admin/admin.html') || path.toLowerCase().endsWith('/admin/')) {
            const mainPanel = document.querySelector('main.panel');
            if (!isAdmin && mainPanel) {
                mainPanel.innerHTML = `
                    <div style="padding:40px;text-align:center;color:var(--text-dim)">
                        <div style="font-size:18px;margin-bottom:12px;">ACCESS DENIED</div>
                        <div style="font-size:12px;">This console is restricted to administrators only.</div>
                        <div style="margin-top:18px;"><a href="/index.html" class="spawn-btn" style="padding:10px 18px;">RETURN</a></div>
                    </div>`;
            }
        }
    } catch (e) {
        // fail silently
    }
}

// Run enforcement on DOM ready and again shortly after auth initialization
document.addEventListener('DOMContentLoaded', enforceAdminVisibility);
setTimeout(enforceAdminVisibility, 600);
// Run a few more times to catch late auth population
[1200, 2500].forEach(t => setTimeout(enforceAdminVisibility, t));