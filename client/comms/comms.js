/* js/comms.js */

// Variables will be initialized when config is loaded
let socket, user, chatContainer;

// Initialize Socket.IO with Auth Token only after config is ready
function initComms() {
    if (!window.CONFIG) {
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
    
    user = JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY));
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
        list.innerHTML = users.map(u => `
            <div class="online-user">
                <div class="user-dot"></div>
                <span>${u.callsign}</span>
            </div>
        `).join('');
    });
}

// 4. Send Message
function sendMsg() {
    if (!socket) return console.warn('Socket not initialized');
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    if (!content) return;

    socket.emit('send_message', { 
        channel: 'global', 
        content: content 
    });
    input.value = '';
}

// 5. SOS Beacon
function triggerSOS() {
    if (!user) {
        alert('ERROR: User not authenticated');
        return;
    }
    const confirmSOS = confirm("BROADCAST EMERGENCY BEACON TO ALL SURVIVORS?");
    if (confirmSOS) {
        socket.emit('sos_beacon', { 
            city: user.region, 
            message: "EMERGENCY: HELP REQUIRED" 
        });
    }
}

function renderMessage(msg, isMine) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${isMine ? 'mine' : ''} ${msg.system ? 'system' : ''}`;
    
    msgDiv.innerHTML = `
        <div class="msg-content">
            <div class="msg-user">${msg.user}</div>
            <div class="msg-text">${msg.content}</div>
        </div>
    `;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initComms);