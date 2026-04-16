# Railway Deployment Guide — Nelson Tour and Safari

## Architecture
```
Railway Project
├── PostgreSQL  (database plugin)
├── Backend     (FastAPI — root dir: backend/)
└── Frontend    (React/Vite — root dir: frontend/)
```

---

## Step 1 — Create Railway Project

1. Go to https://railway.app → **New Project**
2. Choose **Empty Project**

---

## Step 2 — Add PostgreSQL Database

1. In the project dashboard → click **+ New** → **Database** → **PostgreSQL**
2. Railway auto-creates a `DATABASE_URL` variable on this plugin
3. Note it down from **PostgreSQL → Variables → DATABASE_URL**

---

## Step 3 — Deploy the Backend

1. Click **+ New** → **GitHub Repo** → select `ngoe42/New_Tourism_full_fronend`
2. Set **Root Directory** to `backend`
3. Railway will detect `railway.toml` and use it automatically

### Backend Environment Variables (Settings → Variables)

| Variable | Value |
|---|---|
| `DATABASE_URL` | *(copy from PostgreSQL plugin — Railway can also auto-link it)* |
| `SECRET_KEY` | *(generate a strong random string, e.g. 64 chars)* |
| `DEBUG` | `False` |
| `ENVIRONMENT` | `production` |
| `FIRST_ADMIN_EMAIL` | `admin@nelsontoursandsafari.com` |
| `FIRST_ADMIN_PASSWORD` | *(choose a strong password)* |
| `ALLOWED_ORIGINS` | *(leave blank for now — fill in Step 5)* |
| `REDIS_URL` | *(optional — add Redis plugin if needed)* |
| `SENDGRID_API_KEY` | *(your SendGrid API key)* |
| `EMAIL_FROM` | *(your verified SendGrid sender email)* |
| `BACKEND_URL` | `https://YOUR-BACKEND-URL.railway.app` *(fill after Step 3)* |
| `FRONTEND_URL` | `https://YOUR-FRONTEND-URL.railway.app` *(fill after Step 4)* |
| `PESAPAL_CONSUMER_KEY` | *(from Pesapal dashboard — sandbox or live)* |
| `PESAPAL_CONSUMER_SECRET` | *(from Pesapal dashboard)* |
| `PESAPAL_ENVIRONMENT` | `sandbox` (use `live` for production) |
| `PESAPAL_IPN_ID` | *(leave blank — auto-registered on first booking)* |

> **Tip:** In Railway, go to PostgreSQL plugin → **Connect** and use **"Add to service"** to automatically inject `DATABASE_URL` into the backend service.

4. Click **Deploy** — wait for green ✅
5. Copy your backend URL from the **Deployments** tab, e.g. `https://backend-xxx.railway.app`

---

## Step 4 — Deploy the Frontend

1. Click **+ New** → **GitHub Repo** → select `ngoe42/New_Tourism_full_fronend` again
2. Set **Root Directory** to `frontend`
3. Railway will detect `railway.toml` and use it automatically

### Frontend Environment Variables (Settings → Variables)

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL.railway.app/api/v1` |

> Replace `YOUR-BACKEND-URL` with the backend URL from Step 3.
> This variable works **two ways**:
> - **Build time**: Vite bakes it into the JS bundle during `npm run build`
> - **Runtime**: `generate-config.js` writes it into `dist/config.js` before `serve` starts
>
> So even if you add or change the variable **after** the build, the next restart will pick it up.

4. Click **Deploy** — wait for green ✅
5. Copy your frontend URL, e.g. `https://frontend-xxx.railway.app`

---

## Step 5 — Wire Frontend URL into Backend CORS

1. Go back to **Backend service → Settings → Variables**
2. Set:

| Variable | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://YOUR-FRONTEND-URL.railway.app` |

3. Railway will auto-redeploy the backend — done!

---

## Step 6 — Seed Sample Data (optional)

After deployment, run the seed script against the Railway database. Get the connection string from PostgreSQL → **Connect** → copy the **Public URL**, then:

```bash
# Install psycopg2 if needed
pip install psycopg2-binary

# Edit seed.py DB dict to use Railway's public postgres URL
# Then run:
python backend/seed.py
```

Or use Railway's CLI:
```bash
railway run --service backend python seed.py
```

---

## Environment Variable Quick Reference

### Backend
```env
DATABASE_URL=postgresql://...                    # from Railway PostgreSQL plugin
SECRET_KEY=your-super-secret-64-chars
DEBUG=False
ENVIRONMENT=production
ALLOWED_ORIGINS=https://frontend-xxx.railway.app
FIRST_ADMIN_EMAIL=admin@nelsontoursandsafari.com
FIRST_ADMIN_PASSWORD=YourSecurePassword123!

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
EMAIL_FROM=bookings@nelsontoursandsafari.com

# URLs (use your actual Railway service URLs)
BACKEND_URL=https://backend-xxx.railway.app
FRONTEND_URL=https://frontend-xxx.railway.app

# Pesapal Payment Gateway
PESAPAL_CONSUMER_KEY=your-pesapal-consumer-key
PESAPAL_CONSUMER_SECRET=your-pesapal-consumer-secret
PESAPAL_ENVIRONMENT=live                         # sandbox | live
PESAPAL_IPN_ID=                                  # leave blank — auto-registered
```

### Frontend
```env
VITE_API_URL=https://backend-xxx.railway.app/api/v1
```

---

## How Services Communicate

```
Browser → Frontend (Railway)
              │
              │  VITE_API_URL (HTTPS)
              ▼
         Backend (Railway)  ←──── DATABASE_URL ──── PostgreSQL (Railway)
```

- **Browser → Frontend**: served as static files by `serve`
- **Frontend → Backend**: via `VITE_API_URL` (set at build time, baked into JS bundle)
- **Backend → DB**: via `DATABASE_URL` (Railway internal network)

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `CORS error` | Make sure `ALLOWED_ORIGINS` on backend includes the **exact** frontend URL (no trailing slash) |
| `404 on /api/v1/*` | Verify `VITE_API_URL` is set in the frontend service Variables **before** the build ran; redeploy if needed |
| `relation does not exist` | Alembic migrations run automatically on startup via `start.sh` |
| `401 on all requests` | Check `SECRET_KEY` is consistent across restarts (not auto-generated) |
| Frontend shows blank page | Make sure `VITE_API_URL` is set **before** the build runs on Railway |
| Local CORS error (dev) | **Never** set a hardcoded URL in `public/config.js` locally. Leave it as `window.APP_CONFIG = {}` and let the Vite proxy handle `/api/v1` requests to `localhost:8002` |

## Local Development Notes

- Docker maps the API container (port 8000) to **host port 8002**
- Vite proxy (`vite.config.js`) forwards `/api/v1` → `http://localhost:8002`
- `public/config.js` must stay as `window.APP_CONFIG = {}` (no API_URL set) so the proxy is used
- With `DEBUG=true` in `backend/.env`, the backend allows all CORS origins (`*`) automatically
