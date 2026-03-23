/* js/trade.js */
let allTrades = [];

// 1. Load trades from MySQL
async function fetchTrades() {
    try {
        allTrades = await apiFetch('/trades');
        renderTrades(allTrades);
    } catch (err) {
        console.error("Failed to load trades:", err);
    }
}

// 2. Render cards to the grid
function renderTrades(trades) {
    const grid = document.getElementById('trade-grid');
    if (!grid) return;

    grid.innerHTML = trades.map(t => `
        <div class="trade-card">
            <div class="trade-category-badge badge-${t.category}">${t.category}</div>
            <div class="trade-item-name">${t.item_name}</div>
            <p class="trade-desc">${t.description}</p>
            <div class="trade-contact">📡 ${t.contact_info}</div>
            <div style="font-size: 10px; color: var(--text-dim); margin-top: 4px;">📍 ${t.location}</div>
        </div>
    `).join('');
}

// 3. Filter by category
function filterTrades(category, ev) {
    document.querySelectorAll('.trade-tab').forEach(btn => btn.classList.remove('active'));
    if (ev && ev.target) ev.target.classList.add('active');

    if (category === 'all') {
        renderTrades(allTrades);
    } else {
        const filtered = allTrades.filter(t => t.category === category);
        renderTrades(filtered);
    }
}

// 4. Submit new trade to database
async function postTrade() {
    const tradeData = {
        item_name: document.getElementById('t-name').value,
        category: document.getElementById('t-cat').value,
        description: document.getElementById('t-desc').value,
        contact_info: document.getElementById('t-contact').value,
        location: document.getElementById('t-loc').value
    };

    try {
        await apiFetch('/trades', {
            method: 'POST',
            body: JSON.stringify(tradeData)
        });
        
        // Refresh the list after successful post
        fetchTrades();
        alert("TRADE BROADCAST SUCCESSFUL");
    } catch (err) {
        alert("BROADCAST FAILED: Check connection.");
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', fetchTrades);