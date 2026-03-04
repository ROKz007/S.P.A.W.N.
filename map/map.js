let map, heatmap;

// Array of data with Latitude, Longitude, and Intensity
const locations = [
    {lat: 20.2961, lng: 85.8189, intensity: 0.2}, // Bhubaneswar
    {lat: 20.4625, lng: 85.8828, intensity: 0.2}, // Cuttack
    {lat: 22.2564, lng: 84.7914, intensity: 0.2}, // Rourkela
    {lat: 19.3135, lng: 84.7938, intensity: 0.6}, // Berhampur
    {lat: 21.4686, lng: 83.9697, intensity: 0.6}, // Sambalpur
    {lat: 19.8137, lng: 85.8189, intensity: 0.6}, // Puri
    {lat: 21.4920, lng: 86.9300, intensity: 0.6}, // Balasore
    {lat: 21.3667, lng: 83.5972, intensity: 0.6}, // Bargarh
    {lat: 18.7953, lng: 82.7139, intensity: 0.6}, // Koraput
    {lat: 21.8654, lng: 84.2682, intensity: 0.6}, // Jharsuguda
    {lat: 20.2513, lng: 85.5937, intensity: 0.6}, // Balangir
    {lat: 20.2654, lng: 85.5960, intensity: 0.6}, // Dhenkanal
    {lat: 20.7861, lng: 85.0938, intensity: 0.9}, // Keonjhar
    {lat: 20.3919, lng: 86.4044, intensity: 0.9}, // Angul
    {lat: 20.1415, lng: 85.2107, intensity: 0.9}, // Kendrapara
    {lat: 19.1542, lng: 83.3884, intensity: 0.9}, // Nayagarh
    {lat: 18.6364, lng: 81.5637, intensity: 0.9}, // Rayagada
    {lat: 20.9133, lng: 86.3580, intensity: 0.9}, // Malkangiri
    {lat: 22.5871, lng: 86.3633, intensity: 0.9}, // Jajpur
    {lat: 19.1283, lng: 84.4239, intensity: 0.9}, // Mayurbhanj
    {lat: 20.2231, lng: 85.6007, intensity: 0.9}, // Naupada
    {lat: 19.9000, lng: 82.7475, intensity: 0.9}, // Khordha
    {lat: 19.9260, lng: 82.2447, intensity: 0.9}, // Nuapada
    {lat: 19.3055, lng: 84.7914, intensity: 0.9}, // Kalahandi
    {lat: 20.3850, lng: 83.6337, intensity: 0.9}, // Ganjam
    {lat: 21.4182, lng: 84.3664, intensity: 0.9}, // Boudh
    {lat: 22.0975, lng: 84.0497, intensity: 0.9}, // Deogarh
    {lat: 20.2350, lng: 86.1611, intensity: 0.9}, // Sundargarh
    {lat: 19.2264, lng: 85.6206, intensity: 0.9}  // Jagatsinghpur
];

// Initialize the map
function initMap() {
    // Create a new map centered on Odisha
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {lat: 20.2961, lng: 85.8189}, // Centered on Bhubaneswar, Odisha
        mapTypeId: 'satellite' // Set satellite view
    });

    // Create heatmap data array
    const heatmapData = locations.map(location => {
        return {
            location: new google.maps.LatLng(location.lat, location.lng),
            weight: location.intensity
        };
    });

    // Create the heatmap layer
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
        radius: 30, // You can adjust the radius of the heatmap
        dissipating: true // You can set this to false for sharpness
    });

    // Set the color gradient for the heatmap based on intensity
    heatmap.set('gradient', [
        'rgba(0, 255, 0, 0)',   // Transparent green for low intensity (0.2)
        'rgba(255, 255, 0, 1)', // Yellow for mid intensity (0.6)
        'rgba(255, 0, 0, 1)'    // Red for high intensity (0.9)
    ]);

    // Set max intensity for better visualization
    heatmap.set('maxIntensity', 1); // Adjust as per your data
    heatmap.set('opacity', 0.7); // Adjust opacity for better view
}
