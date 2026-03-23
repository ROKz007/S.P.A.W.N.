/* client/js/config.js */
/*
  CONFIG.js
  Backend URLs default to the Render service root below. If you deploy the backend to
  Render under a different URL, update the `SPAWN_BACKEND_URL` global or rebuild
  the static site so the `API_BASE` and `SOCKET_URL` point to the Render service URL.
*/
const BACKEND_ROOT = (typeof window !== 'undefined' && window.SPAWN_BACKEND_URL)
  ? window.SPAWN_BACKEND_URL
  : 'https://spawn-production.up.railway.apps'; // <-- Replace with your Render service URL

const CONFIG = {
  // API and socket endpoints (must match your Render service URL)
  API_BASE: BACKEND_ROOT + '/api',
  SOCKET_URL: BACKEND_ROOT,

  TOKEN_KEY: 'spawn_token',
  USER_KEY: 'spawn_user',

  // Optional: set this to your map provider script URL (e.g. Google, Mapbox, or other).
  // Example for Google Maps (fill your key):
  // https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=visualization
  MAP_API_SCRIPT_URL: '',

  // Render supports WebSockets; enable by default for split deployment.
  ENABLE_SOCKETS: true
};