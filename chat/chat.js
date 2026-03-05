// Initialize connection to the server
const socket = io();

// Listen for incoming messages
socket.on('new_message', (data) => {
    const chatBox = document.querySelector('.chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.style.borderBottom = "1px solid #4caf50";
    msgDiv.style.margin = "10px 0";
    msgDiv.innerHTML = `<small>${data.time}</small> <br> <strong>${data.user}:</strong> ${data.content}`;
    chatBox.appendChild(msgDiv);
    
    // Auto-scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Listen for SOS Beacons
socket.on('sos_received', (data) => {
    alert(`${data.message} from ${data.user} in ${data.city}`);
});

// Function to send a message (Link this to your UI button)
function sendMessage() {
    const input = document.getElementById('messageInput'); // Ensure you have this ID in CHAT.html
    const callsign = JSON.parse(localStorage.getItem('user'))?.callsign || 'Unknown';
    
    if (input.value.trim() !== "") {
        socket.emit('send_message', {
            user: callsign,
            content: input.value
        });
        input.value = "";
    }
}