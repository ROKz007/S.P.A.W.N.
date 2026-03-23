/* client/js/config.js */
const CONFIG = {
  API_BASE: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api',
  
  SOCKET_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin,
    
  TOKEN_KEY: 'spawn_token',
  USER_KEY: 'spawn_user'
  ,
  // Optional: set this to your map provider script URL (e.g. Google, Mapbox, or other).
  // Example for Google Maps (fill your key):
  // 'https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=visualization'
  MAP_API_SCRIPT_URL: ''
  ,
  // Enable sockets in development by default; set to 'true' in production env vars to enable.
  ENABLE_SOCKETS: (function(){
    if (typeof window === 'undefined') return false;
    // Default: enabled on localhost, disabled otherwise
    return window.location.hostname === 'localhost';
  })()
};