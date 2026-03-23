# S.P.A.W.N

Quick setup and required environment variables for running locally and deploying.

## Environment Variables
Create a `.env` file in the repository root or configure these in your hosting provider (Vercel).

Required variables (see `.env.example`):

- `PORT` — port the server listens on (default: 3000)
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_KEY` — Supabase anon/public key (client-safe)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `JWT_SECRET` — secret used to sign JWTs (use a long random string)
- `ENABLE_SOCKETS` — set to `true` to enable socket.io; recommended `false` for serverless deployments

## Notes
- Do NOT commit your real `.env` to the repository. Use `.env.example` as a template.
- For Vercel deployment, add the above variables in the Project Settings → Environment Variables.
- If any keys have been accidentally exposed publicly, rotate them immediately.

## Deploying to Vercel
- This repo contains both a static `client/` folder and an Express `server/`.
- If `ENABLE_SOCKETS` is `false`, the server starts as a normal Express app suitable for serverless platforms.
- If you need persistent WebSocket support, host the socket server separately (e.g., Render, Railway) and set `ENABLE_SOCKETS=true` in that host.
