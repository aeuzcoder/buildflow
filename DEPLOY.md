# BuildFlow — bepul deploy (Oracle’siz)

## 1. GitHub (tayyor)

Repo: `https://github.com/aeuzcoder/buildflow`

Frontend avtomatik **GitHub Pages** ga chiqadi (`main` branch push bo‘lganda).

- URL: `https://aeuzcoder.github.io/buildflow/`

## 2. Bepul PostgreSQL (Neon)

1. [neon.tech](https://neon.tech) → Sign up (bepul)
2. **New Project** → region tanlang
3. **Connection string** ni nusxalang (`postgresql://...?sslmode=require`)

## 3. Backend (Render — bepul)

1. [render.com](https://render.com) → Sign up (GitHub bilan)
2. **New +** → **Blueprint**
3. Repo: `aeuzcoder/buildflow`
4. `DATABASE_URL` ga Neon connection string qo‘ying
5. Deploy tugagach API URL: `https://buildflow-api.onrender.com` (yoki Render bergan nom)

Health: `https://YOUR-API.onrender.com/health`

## 4. Frontend ↔ Backend ulash

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **Variables**:

| Name | Value |
|------|--------|
| `VITE_API_BASE_URL` | `https://YOUR-API.onrender.com/api/v1` |

Keyin **Actions** → **Deploy Frontend** → **Run workflow** (yoki `main` ga push).

## 5. Render CORS

Render dashboard → `buildflow-api` → **Environment**:

```
CORS_ORIGINS=https://aeuzcoder.github.io,http://localhost:3000
```

## Demo login

| Email | Parol |
|-------|--------|
| admin@buildflow.uz | Admin123 |

Batafsil: [CREDENTIALS.md](./CREDENTIALS.md)

## Eslatmalar (free limit)

- Render free: ~15 daqiqa ishlatilmasa **uxlaydi** (birinchi so‘rov 30–60s)
- Neon free: storage va connection limiti bor
- GitHub Pages: oylik traffic limiti bor (odatda yetadi)
