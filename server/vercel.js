const { createApp } = require('./app');

// For serverless environments (Vercel), export the Express app instance.
// Sockets should be disabled for serverless deployments (controlled via ENABLE_SOCKETS env var).
const app = createApp();
module.exports = app;
