/* client/js/config.js */
// client/js/config.js — minimal, editable by build-time or global override
const BACKEND_ROOT = (typeof window !== 'undefined' && window.SPAWN_BACKEND_URL)
  ? window.SPAWN_BACKEND_URL
  : 'https://spawn-production.up.railway.app';

const CONFIG = {
  API_BASE: `${BACKEND_ROOT}/api`,
  SOCKET_URL: BACKEND_ROOT,
  TOKEN_KEY: 'spawn_token',
  USER_KEY: 'spawn_user',
  MAP_API_SCRIPT_URL: '',
  ENABLE_SOCKETS: true
};

// Expose global for classic script usage
if (typeof window !== 'undefined') window.CONFIG = CONFIG;