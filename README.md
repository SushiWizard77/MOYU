# MOYU 🚀 — Career Prep Platform (MERN)

MOYU is a full-stack career-preparation app: roadmaps, practice questions,
coding challenges, assessments, company guides, resources, resume tools,
projects, notifications + an admin panel.

- **Backend:** Node.js + Express + MongoDB (`/backend`, API base `/api/v1`)
- **Frontend:** React 19 + Vite + Tailwind CSS 4 + React Router 7 (`/frontend`)

## Quick start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET, etc.
node seed/seed.js      # seeds roadmaps, companies, practice Qs, assessments + admin user
node server.js         # runs on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health` → `{ "status": "OK" }`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL defaults to http://localhost:5000/api/v1
npm run dev            # runs on http://localhost:5173
```

### 3. Log in

- Student: register at `/register`
- Admin: use `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `backend/.env`
  (defaults: `admin@moyu.dev` / `MoyuAdmin@123`) → opens `/admin`

## Project structure

```
MOYU/
├── backend/            # Express API (config, controllers, middleware, models, routes, seed, utils)
│   ├── server.js       # app entry, mounts /api/v1/* routes
│   ├── .env.example    # safe template (real .env is git-ignored)
│   └── seed/seed.js    # database seeder
├── frontend/           # Vite + React app
│   ├── src/            # pages, components, layouts, context, services, hooks
│   ├── .env.example    # safe template
│   └── vite.config.js
├── .gitignore          # ignores node_modules, .env, dist, logs, root *.txt scratch dumps
└── README.md
```

## API overview (`/api/v1`)

| Prefix             | Area          |
| ------------------ | ------------- |
| `/auth`            | register/login, Google OAuth, password reset |
| `/dashboard`       | user dashboard |
| `/assessments`     | quizzes/assessments |
| `/roadmaps`        | learning roadmaps |
| `/practice`        | practice questions |
| `/companies`       | company guides |
| `/resources`       | curated resources |
| `/resume`          | resume builder |
| `/projects`        | project ideas |
| `/coding`          | coding problems + runner |
| `/notifications`   | user notifications |
| `/admin`           | admin-only management |
| `/theme`           | theme prefs |

## Environment variables

Backend (`backend/.env`, see `.env.example`):
`PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`,
`GOOGLE_CLIENT_ID`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`

Frontend (`frontend/.env`, see `.env.example`):
`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`

> ⚠️ Never commit real `.env` files. Rotate any secret that was ever pasted
> into chat, logs, or a zip before pushing.

## Scripts

Backend: `npm run dev` (nodemon), `npm start`, `npm run seed`
Frontend: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`

## Notes

- `node_modules/`, `dist/`, `*.log`, and the ~96 scratch `*.txt` / lint dumps
  at the old workspace root are intentionally **not committed** (see `.gitignore`).
  They remain on your local disk.
