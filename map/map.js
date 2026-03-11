/* js/heatmap.js */
let map, heatmap;

async function initMap() {
    // 1. Initialize Map
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: { lat: 20.9374, lng: 85.0938 }, // Odisha Center
        zoom: 7,
        mapTypeId: 'satellite',
        disableDefaultUI: true
    });

    // 2. Load Data from Backend
    const data = await apiFetch('/heatmap');
    renderHeatmap(data);
}

function renderHeatmap(points) {
    // Transform DB rows to Google Maps LatLng objects
    const weightedData = points.map(p => ({
        location: new google.maps.LatLng(p.latitude, p.longitude),
        weight: parseFloat(p.intensity)
    }));

    // Create/Update Heatmap Layer
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: weightedData,
        map: map,
        radius: 40,
        opacity: 0.75,
        gradient: [
            'rgba(57,255,20,0)',   // Transparent green
            'rgba(57,255,20,1)',   // Solid green
            '#f8d000',             // Yellow
            '#ff4d4d'              // Rust Bright
        ]
    });
}