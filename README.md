# BuildFlow

Construction site management: orders, deliveries, materials, dashboard.

## Stack

- **Frontend:** React + Vite + Tailwind
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL
- **Deploy:** GitHub Pages (frontend) + Render (backend) + Neon (DB)

## Local run

```bash
# With Docker
docker compose up -d --build

# Or local (Postgres required)
cd backend && python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=postgresql://... uvicorn app.main:app --reload

cd frontend && npm install && npm run dev
```

## Production deploy

See **[DEPLOY.md](./DEPLOY.md)**.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/aeuzcoder/buildflow)

## Demo accounts

See [CREDENTIALS.md](./CREDENTIALS.md).
