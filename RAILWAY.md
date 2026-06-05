# BuildFlow — Railway ga deploy

## 1. Loyiha yaratish

1. [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → `buildflow` reponi tanlang
3. Birinchi avtomatik servis yaratiladi — hozircha e'tibor bermang

## 2. PostgreSQL qo'shish

1. Project ichida **+ New** → **Database** → **PostgreSQL**
2. Servis nomi: `postgres` (muhim — keyin reference uchun)

## 3. Backend servisi

1. **+ New** → **GitHub Repo** → yana `buildflow` reponi tanlang
2. Servis nomi: `buildflow-api`
3. **Settings** → **Root Directory**: `backend`
4. **Settings** → **Networking** → **Generate Domain** (public URL oling)

### Environment Variables (buildflow-api)

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `${{postgres.DATABASE_URL}}` |
| `SECRET_KEY` | tasodifiy uzun matn (masalan `openssl rand -hex 32`) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `CORS_ORIGINS` | `https://${{buildflow.RAILWAY_PUBLIC_DOMAIN}}` |

> `CORS_ORIGINS` ni frontend servisi yaratilgandan keyin yangilang (quyidagi 4-qadam).

## 4. Frontend servisi

1. **+ New** → **GitHub Repo** → `buildflow`
2. Servis nomi: `buildflow`
3. **Settings** → **Root Directory**: `frontend`
4. **Settings** → **Networking** → **Generate Domain**

### Environment Variables (buildflow)

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://${{buildflow-api.RAILWAY_PUBLIC_DOMAIN}}/api/v1` |

> `VITE_` o'zgaruvchilar **build vaqtida** ishlatiladi — qo'shgandan keyin **Redeploy** qiling.

## 5. CORS ni yangilash

Frontend domain chiqqach, `buildflow-api` servisida:

```
CORS_ORIGINS=https://buildflow-production-xxxx.up.railway.app
```

(yoki `${{buildflow.RAILWAY_PUBLIC_DOMAIN}}` reference ishlatiladi)

## 6. Tekshirish

| URL | Kutilgan natija |
|-----|-----------------|
| `https://buildflow-api-xxx.up.railway.app/health` | `{"status":"ok"}` |
| `https://buildflow-xxx.up.railway.app` | Login sahifasi |

**Login:** `admin@buildflow.uz` / `Admin123` (batafsil: `CREDENTIALS.md`)

## Servislar tartibi

```
Railway Project
├── postgres          (PostgreSQL)
├── buildflow-api     (backend, root: backend/)
└── buildflow         (frontend, root: frontend/)
```

## CLI orqali (ixtiyoriy)

```bash
npm install -g @railway/cli
railway login
```

Token: [railway.app/account/tokens](https://railway.com/account/tokens)

```bash
# Token ni terminalda (chatga emas!)
export RAILWAY_TOKEN="your-token"
```
