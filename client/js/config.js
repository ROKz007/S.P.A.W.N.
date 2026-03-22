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
};