/* js/comms.js */

// 1. Initialize Socket.IO with Auth Token
const socket = io(CONFIG.SOCKET_URL, {
    auth: { token: sessionStorage.getItem(CONFIG.TOKEN_KEY) }
});

const chatContainer = document.getElementById('chat-messages');
const user = JSON.parse(sessionStorage.getItem(CONFIG.USER_KEY));

// 2. Receive Messages
socket.on('new_message', (msg) => {
    const isMine = msg.user === user.callsign;
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

// 4. Send Message
function sendMsg() {
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