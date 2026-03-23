# S.P.A.W.N

Project description: Short placeholder for S.P.A.W.N. Replace this with a brief project overview.

## Deployment

Backend (Railway / Render):

- Host the backend (the contents of this repo's `server/`) on a host that supports persistent sockets.
- Required environment variables on the backend:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `JWT_SECRET`
  - `ENABLE_SOCKETS` (set to `true` on the backend host)
  - `FRONTEND_URL` (your Vercel URL, e.g., `https://your-app.vercel.app`)

Frontend (Vercel):

- Deploy the `client/` folder as a static site on Vercel.
- Ensure `client/js/config.js` points to your backend URL (or set `window.SPAWN_BACKEND_URL` at runtime).

Notes:

- Keep `SUPABASE_SERVICE_ROLE_KEY` secret and only set it on the backend host.
- After deployment, set `FRONTEND_URL` on the backend host to allow CORS from the frontend.
