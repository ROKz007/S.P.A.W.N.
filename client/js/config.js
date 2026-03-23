/* client/js/config.js */
const CONFIG = {
  // Backend API base (Render-hosted backend placeholder)
  API_BASE: 'https://spawn-backend.onrender.com/api',

  // Socket server root (Render-hosted root)
  SOCKET_URL: 'https://spawn-backend.onrender.com',

  TOKEN_KEY: 'spawn_token',
  USER_KEY: 'spawn_user',

  // Optional: set this to your map provider script URL (e.g. Google, Mapbox, or other).
  // Example for Google Maps (fill your key):
  // https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=visualization
  MAP_API_SCRIPT_URL: '',

  // Render supports WebSockets; enable by default for split deployment.
  ENABLE_SOCKETS: true
};