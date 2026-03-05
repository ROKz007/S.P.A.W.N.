// Function to display live trade offers from DB
function displayTradeOffers() {
    const listingContainer = document.querySelector('.listings-box');
    listingContainer.innerHTML = '<h3>Items Available for Trade</h3>';

    fetch('/api/trades')
        .then(response => response.json())
        .then(trades => {
            if (trades.length === 0) {
                listingContainer.innerHTML += '<p>No active trade transmissions found.</p>';
                return;
            }
            trades.forEach(offer => {
                const tradeListing = document.createElement('div');
                tradeListing.classList.add('listing');
                tradeListing.innerHTML = `
                    <h5>Category: ${offer.category.toUpperCase()}</h5>
                    <h5>Item: ${offer.item_name}</h5>
                    <p><strong>Description:</strong> ${offer.description}</p>
                    <p><strong>Contact:</strong> ${offer.contact}</p>
                    <p><strong>Sector:</strong> ${offer.location || 'Unknown'}</p>
                `;
                listingContainer.appendChild(tradeListing);
            });
        })
        .catch(() => { listingContainer.innerHTML += '<p>Error fetching trade data.</p>'; });
}

function loadAdditionalInfo() {
    // These still use local placeholders until Step 5 (WebSockets)
    const liveUsersCount = localStorage.getItem('liveUsers') || 0;
    const safeZones = JSON.parse(localStorage.getItem('safeZones')) || [];
    document.getElementById('liveUsersCount').textContent = `${liveUsersCount} Users Online`;
    document.getElementById('safeZonesList').textContent = safeZones.length > 0 ? safeZones.join(', ') : 'No safe zones available.';
}

displayTradeOffers();
loadAdditionalInfo();

const adminMessage = localStorage.getItem('adminMessage');
if (adminMessage) {
    document.getElementById('adminMessageBox').style.display = 'block';
    document.getElementById('adminMessageContent').textContent = adminMessage;
}