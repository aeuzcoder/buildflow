# BuildFlow

Qurilish materiallari boshqaruv tizimi: buyurtmalar, yetkazib berish, ombor, dashboard.

## Stack

- **Frontend:** React + Vite + Tailwind
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL
- **Deploy:** Railway (tavsiya) yoki Docker Compose

## Tez ishga tushirish

```bash
cp .env.example .env
docker compose up -d --build
```

Brauzer: **http://localhost:3000**

## Deploy

| Platforma | Yo'riqnoma |
|-----------|------------|
| **Railway** (tavsiya) | [RAILWAY.md](./RAILWAY.md) |
| Docker / VPS / Render | [DEPLOY.md](./DEPLOY.md) |

## Demo login

| Email | Parol |
|-------|-------|
| admin@buildflow.uz | Admin123 |

Batafsil: [CREDENTIALS.md](./CREDENTIALS.md)
