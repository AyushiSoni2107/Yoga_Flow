# Backend Setup

## 1) Start MongoDB (for Compass/local)
Use this URI in MongoDB Compass:
`mongodb://127.0.0.1:27017/yoga_floww`

## 2) Configure env
Create `backend/.env` from `backend/.env.example`.

## 3) Run backend
```bash
cd backend
npm install
npm run dev
```

API base: `http://localhost:5000/api`

## 4) Seed MongoDB Atlas data
```bash
cd backend
npm run seed
```

This inserts starter data only into empty collections.

## Endpoints
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (Bearer token)
- `GET /classes`
- `POST /classes`
- `GET /blogs`
- `GET /pricing`
- `POST /contact`
