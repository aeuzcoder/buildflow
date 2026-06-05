# BuildFlow — O'rnatish va ishga tushirish

Qurilish materiallari boshqaruv tizimi (React + FastAPI + PostgreSQL).

> **Railway ga deploy:** [RAILWAY.md](./RAILWAY.md) (tavsiya etiladi)

## Talablar

- **Docker** va **Docker Compose** o'rnatilgan bo'lishi kerak
  - Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Linux: `docker` + `docker compose` plugin

## Tez ishga tushirish (Docker — tavsiya etiladi)

### 1. Zip ni oching

```bash
unzip buildflow.zip
cd buildflow
```

### 2. Muhit o'zgaruvchilarini sozlang

```bash
cp .env.example .env
```

Production uchun `.env` faylida **SECRET_KEY** ni o'zgartiring (tasodifiy uzun matn).

### 3. Ishga tushiring

```bash
docker compose up -d --build
```

Birinchi marta 5–10 daqiqa ketishi mumkin (image build + paketlar yuklanadi).

### 4. Brauzerda oching

| Xizmat | Manzil |
|--------|--------|
| **Veb-ilova** | http://localhost:3000 |
| **API** | http://localhost:8000 |
| **API health** | http://localhost:8000/health |

### 5. To'xtatish

```bash
docker compose down
```

Ma'lumotlar saqlanadi. To'liq o'chirish:

```bash
docker compose down -v
```

---

## Demo login ma'lumotlari

Batafsil: `CREDENTIALS.md`

| Rol | Email | Parol |
|-----|-------|-------|
| Admin | admin@buildflow.uz | Admin123 |
| Ombor menejeri | warehouse@buildflow.uz | BuildFlow123 |

---

## Serverga deploy (VPS)

Ubuntu/Debian serverda:

```bash
# Docker o'rnatish (agar yo'q bo'lsa)
curl -fsSL https://get.docker.com | sh

# Loyihani yuklash va ishga tushirish
unzip buildflow.zip && cd buildflow
cp .env.example .env
# .env da SECRET_KEY ni o'zgartiring
docker compose up -d --build
```

Server firewallda **3000** portini oching. Domen ulangan bo'lsa, nginx orqali 80/443 ga yo'naltiring.

---

## Render.com ga deploy (bulut)

3 ta alohida servis kerak:

### 1. PostgreSQL
- Name: `buildflow-db`
- Region: Virginia (US East)
- Plan: Free

### 2. Backend (Web Service)
- Root Directory: `backend`
- Language: Docker
- Environment Variables:
  - `DATABASE_URL` = PostgreSQL Internal URL
  - `SECRET_KEY` = tasodifiy kalit
  - `ALGORITHM` = `HS256`
  - `ACCESS_TOKEN_EXPIRE_MINUTES` = `30`
  - `CORS_ORIGINS` = frontend URL (masalan `https://buildflow.onrender.com`)

### 3. Frontend (Static Site)
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable:
  - `VITE_API_BASE_URL` = `https://SIZNING-BACKEND-URL.onrender.com/api/v1`

---

## Loyiha tuzilmasi

```
buildflow/
├── backend/          # FastAPI API
├── frontend/         # React veb-ilova
├── docker-compose.yml
├── .env.example      # Muhit o'zgaruvchilari namunasi
├── CREDENTIALS.md    # Demo loginlar
└── DEPLOY.md         # Ushbu fayl
```

## Muammolar

| Muammo | Yechim |
|--------|--------|
| Port band | `docker compose down`, keyin qayta `up` |
| Login ishlamaydi | Backend log: `docker compose logs backend` |
| Sahifa ochilmaydi | `docker compose ps` — barcha servislar `running` bo'lishi kerak |
| Demo ma'lumotlarni qayta yuklash | `docker compose exec backend python -m app.db.seed` |
