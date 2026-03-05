let map, heatmap;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {lat: 20.2961, lng: 85.8189},
        mapTypeId: 'satellite'
    });

    // Fetch live data from the backend
    fetch('/api/heatmap')
        .then(response => response.json())
        .then(data => {
            const heatmapData = data.map(location => ({
                location: new google.maps.LatLng(location.latitude, location.longitude),
                weight: parseFloat(location.intensity)
            }));

            heatmap = new google.maps.visualization.HeatmapLayer({
                data: heatmapData,
                map: map,
                radius: 30,
                dissipating: true
            });

            heatmap.set('gradient', [
                'rgba(0, 255, 0, 0)',   
                'rgba(255, 255, 0, 1)', 
                'rgba(255, 0, 0, 1)'    
            ]);
            heatmap.set('opacity', 0.7);
        })
        .catch(err => console.error("Could not load threat data:", err));
}