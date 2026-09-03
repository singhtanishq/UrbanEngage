# Urban Engage: An e-Governance Platform

Urban Engage is an e-governance platform that facilitates communication and interaction between citizens and local authorities. Citizens can report civic issues, discuss topics in forums, RSVP to community events, start and sign petitions, vote in polls, and volunteer for local initiatives.

This repository contains a fully revamped version of the platform: a redesigned, animated, professional UI on the frontend and a hardened, best-practice Express/MongoDB API on the backend.

- Frontend: React 18 (Create React App), React Router 6, custom design system, lucide-react icons
- Backend: Node.js, Express, Mongoose (MongoDB), JWT auth, Helmet, rate limiting
- Deployment: Netlify (frontend) + Render (backend) + MongoDB Atlas

## Project structure

```
backend/
  server.js               # app bootstrap: env config, security middleware, error handling
  seed.js                 # demo data seeder (node seed.js --reset)
  middleware/             # auth (JWT), validation helpers, central error handler
  models/                 # Mongoose schemas
  routes/                 # REST endpoints per module
  .env.example            # required environment variables
frontend/
  public/_redirects       # Netlify SPA routing
  src/
    api/                  # fetch client (env-driven base URL) + endpoint services
    context/              # AuthContext, ToastContext
    components/
      layout/             # Header, Footer
      ui/                 # design-system components (Button, Modal, Badge, Avatar, …)
    hooks/                # useCountUp
    pages/                # Home, Dashboard, Forums, Events, Issues, Petitions, Polls, Volunteers, Accounts
    styles/               # design tokens + base styles (CSS custom properties)
    utils/                # formatting + interaction guards
  .env.example            # REACT_APP_API_URL
```

## Features

- **Home** — animated dark hero with live clock, platform-wide search, module cards, and a "report to resolution" walkthrough.
- **Dashboard** — live platform stats (real database counts, animated counters), recent activity feed assembled from the latest issues/events/petitions, and quick links.
- **Forums** — threaded discussions with search, a thread drawer, and replies (new).
- **Events** — rich event cards (date badge, location, category), search + sorting, RSVP with one-per-browser guard, and event creation.
- **Issues** — report issues with category + author, filter chips, status pipeline (Open → In Progress → Resolved), upvotes and comments.
- **Petitions** — petitions with descriptions, signature goals, deadlines, animated progress bars, and signing.
- **Polls** — create polls (2–5 options), vote, and watch animated real-time result bars.
- **Volunteers** — registration with duplicate-email protection, category filters, and grouped volunteer cards.
- **Accounts** — split-panel sign in/sign up with password strength meter, profile editing (name and/or password), JWT sessions, and toast notifications.

Accessibility and polish: keyboard-navigable modals, focus-visible rings, `prefers-reduced-motion` support, skeleton loaders, empty/error states, and toasts.

## Installation and setup

### Prerequisites

- Node.js 14+ (18+ recommended)
- MongoDB — a local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- Git

> **macOS note:** AirPlay Receiver listens on port 5000. The bundled dev configs use **5050** for the API instead. Either keep 5050 or disable AirPlay Receiver (System Settings → General → AirDrop & Handoff).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # then edit MONGODB_URI and JWT_SECRET
npm start                  # API on http://localhost:5050
```

Optional demo data:

```bash
node seed.js --reset       # wipes and seeds realistic demo content
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env       # set REACT_APP_API_URL=http://localhost:5050 for local dev
npm start                  # app on http://localhost:3000
```

A demo login is created by the seeder: `demo@urbanengage.dev` / `demopass123`.

### Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | backend | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | backend | Long random string used to sign JWTs (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | backend | Token lifetime (default `7d`) |
| `PORT` | backend | API port (Render injects this automatically) |
| `CORS_ORIGIN` | backend | Optional: restrict API to your frontend origin |
| `REACT_APP_API_URL` | frontend | Backend base URL, e.g. `https://your-api.onrender.com` |

## API overview

All endpoints are JSON. Validation errors return `400`, missing resources `404`, auth failures `401`, duplicates `409`. `GET /health` reports uptime and database status.

| Module | Endpoints |
| --- | --- |
| Accounts | `POST /accounts/signup`, `POST /accounts/login`, `POST /accounts/update` (auth), `GET /accounts/me` (auth) |
| Dashboard | `GET /dashboard/stats` (live counts + activity), legacy `GET/POST /dashboard` |
| Forums | `GET /forums`, `POST /forums/add`, `POST /forums/threads/:threadId/reply` |
| Events | `GET /events`, `POST /events/add`, `POST /events/rsvp/:id`, `DELETE /events/:id` |
| Issues | `GET /issues`, `POST /issues/add`, `POST /issues/upvote/:id`, `POST /issues/comment/:id`, `POST /issues/status/:id` |
| Petitions | `GET /petitions`, `POST /petitions/add`, `POST /petitions/sign/:id` |
| Polls | `GET /polls`, `POST /polls/add`, `POST /polls/vote/:id` |
| Volunteers | `GET /volunteers`, `POST /volunteers/add` |
| Home / Features | legacy content endpoints, unchanged |

Authenticated requests send `Authorization: Bearer <token>`.

## Deployment

### Backend (Render)

1. Create a **Web Service** from your repo, root directory `backend`, build `npm install`, start `npm start`.
2. Set environment variables: `MONGODB_URI` (Atlas URI), `JWT_SECRET`, `NODE_ENV=production`, and optionally `CORS_ORIGIN=https://your-site.netlify.app`. `PORT` is provided by Render.
3. **Rotate your MongoDB password first if it was ever committed** — see the security note below.

### Frontend (Netlify)

1. Build command `npm run build`, publish directory `frontend/build`.
2. Set the environment variable `REACT_APP_API_URL=https://your-api.onrender.com` (Site settings → Environment variables). Without it, the deployed app cannot reach the API.
3. `public/_redirects` (already included) makes deep links like `/issues` work on Netlify.

## Security notes

- The original `server.js` contained a hardcoded MongoDB Atlas URI **with credentials** and a hardcoded JWT secret. Both are removed — credentials now come from environment variables only. If this repository was ever public with those credentials, **rotate the database password immediately** (Atlas → Database Access → Edit user).
- Passwords are hashed with bcrypt; login responses do not reveal whether an email exists; invalid tokens return `401`; Helmet and rate limiting are enabled; request bodies are size-limited and validated per route.

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
