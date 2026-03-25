/* js/comms.js */

// Variables will be initialized when config is loaded
let socket, user, chatContainer;

// Initialize Socket.IO with Auth Token only after config is ready
function initComms() {
    if (!window.CONFIG) {
        setTimeout(initComms, 100);
        return;
    }
    if (typeof window.io === 'undefined') {
        // Wait for socket.io client to finish loading
        setTimeout(initComms, 100);
        return;
    }
    // Respect feature flag: do nothing if sockets are disabled
    if (!CONFIG.ENABLE_SOCKETS) {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) chatContainer.innerHTML = '<div style="padding:12px;color:#fff;">Real-time comms disabled.</div>';
        console.info('Socket comms disabled by client config.');
        return;
    }
    
    try { user = JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY)); } catch(e){ user = null; }
    chatContainer = document.getElementById('chat-messages');
    
    socket = io(CONFIG.SOCKET_URL, {
        auth: { token: sessionStorage.getItem(CONFIG.TOKEN_KEY) }
    });

    // 2. Receive Messages
    socket.on('new_message', (msg) => {
        const isMine = user && msg.user === user.callsign;
        renderMessage(msg, isMine);
    });

    // 3. Update Online List
    socket.on('user_online_update', (users) => {
        const list = document.getElementById('online-users');
        if (!list) return;
        list.innerHTML = users.map(u => `
            <div class="online-user">
                <div class="user-dot"></div>
                <span>${u.callsign}</span>
            </div>
        `).join('');
    });

    // 4. Incoming SOS beacons
    socket.on('sos_received', (data) => {
        try {
            const text = `${data.user || 'UNKNOWN'} // SOS @ ${data.city || 'UNKNOWN'}`;
            if (typeof showToast === 'function') showToast(text, 6000);
            localStorage.setItem('lastSOS', JSON.stringify({ user: data.user, city: data.city, time: Date.now(), message: data.message }));
            // show on map if available
            if (window.showSOSOnMap) window.showSOSOnMap(data.city, data.user);
        } catch (e) {}
    });

    // SOS rejected (cooldown) — notify sender
    socket.on('sos_rejected', (data) => {
        try {
            if (data && data.reason === 'cooldown') {
                if (typeof showToast === 'function') showToast(`SOS COOLDOWN: wait ${data.remaining}s`, 4000);
            }
        } catch (e) {}
    });
}

// 4. Send Message
function sendMsg() {
    if (!socket) return console.warn('Socket not initialized');
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    if (!content) return;
    // rely on server socket.user for authenticity, but include user for graceful fallback
    socket.emit('send_message', { 
        channel: 'global', 
        content: content,
        user: user ? user.callsign : undefined
    });
    input.value = '';
}

// 5. SOS Beacon
function triggerSOS() {
    if (!user) {
        alert('ERROR: User not authenticated');
        return;
    }
    const COOLDOWN = 60; // seconds
    try {
        const last = parseInt(sessionStorage.getItem('lastSosSentAt') || '0', 10);
        const now = Date.now();
        if (last && (now - last) < COOLDOWN * 1000) {
            const rem = Math.ceil((COOLDOWN * 1000 - (now - last)) / 1000);
            if (typeof showToast === 'function') showToast(`LOCAL COOLDOWN: wait ${rem}s`, 3000);
            return;
        }
    } catch (e) {}

    const confirmSOS = confirm("BROADCAST EMERGENCY BEACON TO ALL SURVIVORS?");
    if (confirmSOS) {
        // optimistic local cooldown to prevent double-clicks
        try { sessionStorage.setItem('lastSosSentAt', Date.now().toString()); } catch (e) {}

        // If sockets are enabled and initialized, send via socket, else fallback to REST API
        if (socket && CONFIG.ENABLE_SOCKETS) {
            socket.emit('sos_beacon', { 
                city: user.region, 
                message: "EMERGENCY: HELP REQUIRED",
                user: user.callsign
            });
        } else {
            // Fallback: POST to /api/sos (requires auth)
            (async function(){
                try {
                    await apiFetch('/sos', {
                        method: 'POST',
                        body: JSON.stringify({ city: user.region, message: 'EMERGENCY: HELP REQUIRED' })
                    });
                    if (typeof showToast === 'function') showToast('SOS SENT (HTTP)', 4000);
                } catch (err) {
                    // apiFetch throws for 429 and other errors; handle cooldown detail
                    try {
                        const body = err.message || '';
                        // If server responded with structured error, apiFetch already logged; show generic
                        if (typeof showToast === 'function') showToast('SOS FAILED: ' + (err.message || 'error'), 4000);
                    } catch (e) {}
                }
            })();
        }
    }
}

function renderMessage(msg, isMine) {
    if (!chatContainer) chatContainer = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg';
    if (isMine) msgDiv.classList.add('mine');
    if (msg.system) msgDiv.classList.add('system');

    const contentWrap = document.createElement('div');
    contentWrap.className = 'msg-content';

    const userEl = document.createElement('div');
    userEl.className = 'msg-user';
    userEl.textContent = msg.user || 'SYSTEM';

    const textEl = document.createElement('div');
    textEl.className = 'msg-text';
    const caller = msg.user || 'SYSTEM';
    textEl.textContent = `=> ${caller} - ${msg.content || ''}`;

    contentWrap.appendChild(userEl);
    contentWrap.appendChild(textEl);
    msgDiv.appendChild(contentWrap);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // If this is a system broadcast, persist to localStorage so dashboard can show it
    try {
        if (msg.system && msg.content) {
            // store only the broadcast text (strip prefix if present)
            const cleaned = msg.content.replace(/^BROADCAST:\s*/i, '');
            localStorage.setItem('adminMessage', cleaned);
        }
    } catch (e) {}
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initComms);
