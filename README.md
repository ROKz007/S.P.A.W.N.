# S.P.A.W.N. — Survival Portal And World Network

> A full-stack, real-time coordination platform for post-apocalyptic survival scenarios, featuring live threat mapping, resource trading, encrypted communications, and role-based access control.

**Developer:** Ashmit Kar

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Real-Time | Socket.IO |
| Mapping | Leaflet.js / Google Maps API |
| Auth | JWT + bcrypt |

---

## Features

- **Regional Threat Heatmap** — Live geospatial threat visualization across Odisha sectors using Leaflet.js, with real-time admin-injected overlays
- **Survivor Trade Post** — Peer-to-peer barter marketplace categorized by medical supplies, equipment, and apparel
- **Channel Alpha (Real-Time Comms)** — Persistent encrypted global chat and one-click SOS beacon via Socket.IO
- **Admin Command Center** — Restricted console for threat data injection and system-wide alert broadcasting
- **Secure Auth** — Role-based access (Survivor / Admin) with JWT sessions and bcrypt password hashing

---

## Architecture

```
Client (Vercel)  ──HTTPS/WSS──  Express Server (Railway)
                                    ├── REST API
                                    ├── Socket.IO
                                    ├── Auth & Admin Middleware
                                    └── Supabase (PostgreSQL)
```

- Decoupled static frontend and persistent socket-enabled backend
- Middleware-driven security: rate limiter → JWT verification → role check → route handler
- Supabase Row-Level Security as a secondary data access defense

---

## Deployment

### Backend → Railway / Render

Set environment variables and deploy the `server/` directory:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ENABLE_SOCKETS=true
```

### Frontend → Vercel

Update `client/js/config.js` with your backend URL, then deploy the `client/` directory as a static site.

---

## Project Structure

```
spawn/
├── client/          # Static frontend
│   ├── css/
│   └── js/
│       └── config.js   # ← Set backend URL here
└── server/          # Node.js backend
    ├── routes/      # auth, threats, trade, admin
    ├── middleware/  # authMiddleware, adminMiddleware
    ├── sockets/     # Socket.IO event handlers
    └── supabase/    # DB client
```

---

*Built by Ashmit Kar · [LinkedIn](https://linkedin.com/in/ashmit-kar/) · [GitHub](https://github.com/ROKz007/)*