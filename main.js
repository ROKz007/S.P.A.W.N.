// Retrieve trade offers from localStorage
const tradeOffers = JSON.parse(localStorage.getItem('tradeOffers')) || [];

// Function to display trade offers
function displayTradeOffers() {
    const listingContainer = document.querySelector('.listings-box');
    listingContainer.innerHTML = '<h3>Items Available for Trade</h3>';
    tradeOffers.forEach(offer => {
        const tradeListing = document.createElement('div');
        tradeListing.classList.add('listing');
        tradeListing.innerHTML = `
            <h5>Category: ${offer.category}</h5>
            <h5>Item: ${offer.itemName}</h5>
            <p><strong>Trade For:</strong> ${offer.tradeFor}</p>
            <p><strong>Description:</strong> ${offer.itemDescription}</p>
            <p><strong>Contact:</strong> ${offer.contactNumber}</p>
        `;
        listingContainer.appendChild(tradeListing);
    });
}

// Load data for live users and safe zones
function loadAdditionalInfo() {
    const liveUsersCount = localStorage.getItem('liveUsers') || 0;
    const safeZones = JSON.parse(localStorage.getItem('safeZones')) || [];

    document.getElementById('liveUsersCount').textContent = `${liveUsersCount} Users Online`;
    document.getElementById('safeZonesList').textContent = safeZones.length > 0 
        ? safeZones.join(', ') 
        : 'No safe zones available.';
}

// Display trade offers
displayTradeOffers();

// Display additional info
loadAdditionalInfo();

// Display admin message if available
const adminMessage = localStorage.getItem('adminMessage');
if (adminMessage) {
    document.getElementById('adminMessageBox').style.display = 'block';
    document.getElementById('adminMessageContent').textContent = adminMessage;
}
