// Function to submit the admin message and store it in localStorage
function submitMessage() {
    var message = document.getElementById('adminMessage').value;
    if (message) {
        // Store the message in localStorage
        localStorage.setItem('adminMessage', message);
        alert('Message Submitted: ' + message); // Alert for confirmation
    } else {
        alert('Please enter a message!');
    }
}

// Function to submit the selected city and intensity to the server
function submitLocation() {
    var city = document.getElementById('cityDropdown').value;
    var intensity = parseFloat(document.getElementById('intensity').value);
    
    if (city && !isNaN(intensity)) {
        // Coordinates for cities in Odisha
        var cityCoordinates = {
            Bhubaneswar: { lat: 20.2961, lon: 85.8189 },
            Cuttack: { lat: 20.4625, lon: 85.8828 },
            Berhampur: { lat: 19.3135, lon: 84.7938 },
            Rourkela: { lat: 22.2610, lon: 84.7913 },
            Balasore: { lat: 21.4980, lon: 86.9347 },
            Sambalpur: { lat: 21.4683, lon: 83.9770 },
            Koraput: { lat: 18.7910, lon: 82.7136 },
            Baripada: { lat: 21.9281, lon: 86.7220 },
            Jeypore: { lat: 18.7861, lon: 82.6167 },
            Angul: { lat: 20.2458, lon: 85.0848 },
            Kendrapara: { lat: 20.4111, lon: 86.4147 },
            Dhenkanal: { lat: 20.3317, lon: 85.5972 },
            Bargarh: { lat: 21.3667, lon: 83.6300 },
            Nayagarh: { lat: 20.1536, lon: 85.0784 },
            Puri: { lat: 19.8135, lon: 85.8310 },
            Jagatsinghpur: { lat: 20.2494, lon: 86.1806 },
            Kendujhar: { lat: 22.1100, lon: 85.4967 },
            Malkangiri: { lat: 18.6566, lon: 81.9464 },
            Ganjam: { lat: 19.3800, lon: 84.9300 },
            Kalahandi: { lat: 19.9319, lon: 82.2404 }
        };

        var coordinates = cityCoordinates[city];

        // Make AJAX request to the server
        fetch('/submit-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: coordinates.lat,
                longitude: coordinates.lon,
                intensity: intensity
            })
        })
        .then(response => response.json())
        .then(data => {
            alert('Location Submitted: ' + data.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        alert('Please select a city and enter a valid intensity!');
    }
}
