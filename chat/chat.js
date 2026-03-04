// JavaScript to fetch the message from localStorage and display it
var adminMessage = localStorage.getItem("adminMessage");

// If a message exists, display it
if (adminMessage) {
  document.getElementById("adminMessageBox").style.display = "block";
  document.getElementById("adminMessageContent").textContent = adminMessage;
}
