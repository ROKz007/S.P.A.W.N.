/* js/heatmap.js */
let map, heatmap;

function _hasGoogleMaps() {
    return typeof google !== 'undefined' && google.maps;
}

function _hasLeaflet() {
    return typeof L !== 'undefined' && typeof L.map === 'function';
}

// Expose initMap globally for provider callbacks. Will attempt to use Google Maps
// if available, otherwise will try a generic `MapLib` provider (if you supply one).
window.initMap = function initMap() {
    const center = { lat: 20.9374, lng: 85.0938 };

    if (_hasGoogleMaps()) {
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center,
            zoom: 7,
            mapTypeId: 'satellite',
            disableDefaultUI: true
        });

        apiFetch('/heatmap')
            .then(data => renderHeatmap(data))
            .catch(err => console.error('Failed to load heatmap data:', err));

        return;
    }
    // Leaflet provider
    if (_hasLeaflet()) {
        // Create Leaflet map constrained to Odisha bounds
        const mapEl = document.getElementById('map-canvas');
        mapEl.style.height = mapEl.style.height || '600px';

        // Approximate Odisha bounds (lat,lng): SW, NE
        const ODISHA_BOUNDS = [[17.4, 80.9], [22.9, 87.9]];

        map = L.map('map-canvas', { zoomControl: false, maxBounds: ODISHA_BOUNDS, maxBoundsViscosity: 0.8 })
            .setView([center.lat, center.lng], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        apiFetch('/heatmap')
            .then(data => {
                // Filter points to those within Odisha bounds just in case
                const filtered = data.filter(p => {
                    const lat = parseFloat(p.latitude);
                    const lng = parseFloat(p.longitude);
                    return lat >= ODISHA_BOUNDS[0][0] && lat <= ODISHA_BOUNDS[1][0]
                        && lng >= ODISHA_BOUNDS[0][1] && lng <= ODISHA_BOUNDS[1][1];
                });
                if (filtered.length) {
                    renderHeatmap(filtered);
                    // Fit to Odisha bounds so map shows state area only
                    try { map.fitBounds(ODISHA_BOUNDS, { padding: [20,20] }); } catch (e) {}
                } else {
                    renderHeatmap(data);
                }
            })
            .catch(err => console.error('Failed to load heatmap data:', err));

        return;
    }

    // Support for a lightweight custom provider API named `MapLib` (optional):
    // MapLib.createMap(elementId, options) -> returns map instance
    // MapLib.LatLng(lat,lng) -> latlng object
    // MapLib.HeatmapLayer({data, map, radius, opacity, gradient})
    if (window.MapLib && MapLib.createMap) {
        map = MapLib.createMap('map-canvas', {
            center,
            zoom: 7,
            mapTypeId: 'satellite',
            disableDefaultUI: true
        });

        apiFetch('/heatmap')
            .then(data => renderHeatmap(data))
            .catch(err => console.error('Failed to load heatmap data:', err));

        return;
    }

    // No provider available: leave a helpful message in the map container and noop.
    const canvas = document.getElementById('map-canvas');
    if (canvas) {
        canvas.innerHTML = '<div style="padding:20px;color:#fff;background:#222;border-radius:6px;max-width:420px;margin:24px;">No map provider configured. Set <strong>CONFIG.MAP_API_SCRIPT_URL</strong> in <em>client/js/config.js</em> or include a supported map script.</div>';
    }
    console.warn('No map provider available. Set CONFIG.MAP_API_SCRIPT_URL in client/js/config.js');
};

function renderHeatmap(points) {
    const gradient = [
        'rgba(57,255,20,0)',
        'rgba(57,255,20,1)',
        '#f8d000',
        '#ff4d4d'
    ];
    // Leaflet branch (handle at runtime even if plugin loaded after this script)
    if (_hasLeaflet() && typeof L.heatLayer === 'function') {
        const latlngs = points.map(p => [parseFloat(p.latitude), parseFloat(p.longitude), parseFloat(p.intensity) || 0.5]);
        if (!map) {
            console.warn('Leaflet map instance not found while rendering heatmap.');
            return;
        }
        if (heatmap && heatmap.setLatLngs) {
            heatmap.setLatLngs(latlngs);
        } else {
            heatmap = L.heatLayer(latlngs, { radius: 25, blur: 15, maxZoom: 11, max: 1.0 }).addTo(map);
        }
        return;
    }

    if (_hasGoogleMaps()) {
        const weightedData = points.map(p => ({
            location: new google.maps.LatLng(p.latitude, p.longitude),
            weight: parseFloat(p.intensity)
        }));

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: weightedData,
            map: map,
            radius: 40,
            opacity: 0.75,
            gradient
        });
        return;
    }

    if (window.MapLib && MapLib.HeatmapLayer) {
        const weightedData = points.map(p => ({ lat: p.latitude, lng: p.longitude, weight: parseFloat(p.intensity) }));
        if (heatmap && typeof heatmap.setData === 'function') {
            heatmap.setData(weightedData);
        } else {
            heatmap = new MapLib.HeatmapLayer({ data: weightedData, map: map, radius: 40, opacity: 0.75, gradient });
        }
        return;
    }

    console.warn('Heatmap render skipped — no map provider available.');
}

// No additional overrides required; renderHeatmap handles Leaflet at runtime.