# MOYU — Setup Instructions

## Backend
```
cd backend
npm install
```
Update `backend/.env`:
- `MONGO_URI` — rotate/replace this. The original value was exposed in the uploaded zip; treat it as compromised.
- `JWT_SECRET` — already regenerated to a strong random value.
- Optional: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` to control the seeded admin login (defaults to `admin@moyu.dev` / `MoyuAdmin@123`).

Seed the database (roadmaps, companies, resources, practice questions, assessments, and one admin account):
```
node seed/seed.js
```

Run the server:
```
node server.js
```

## Frontend
```
cd frontend
npm install
npm run dev
```
`frontend/.env` already points `VITE_API_URL` at `http://localhost:5000/api/v1` — update this if your backend runs elsewhere.

## Logging in
- Register a normal account at `/register` for the student experience.
- Log in with the seeded admin account to reach `/admin` (also appears as "Admin Panel" in the sidebar automatically once logged in as an admin).
