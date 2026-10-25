# Local Hosting Guide — Moving off Railway

This stack now runs entirely on one machine with Docker Compose:

```
Browser
  │
  ▼
Frontend (Node server.js)  http://localhost:3000
  │  /api/v1  (VITE_API_URL)
  ▼
Backend (FastAPI)          http://localhost:8002
  │  DATABASE_URL / REDIS_URL
  ▼
PostgreSQL (db)  +  Redis (redis)
```

Everything Railway-specific (staging redirects, ephemeral storage assumptions)
is disabled locally. Production redirects remain available through env vars if
you ever self-host behind a real domain.

---

## 1. Prerequisites

- Docker + Docker Compose
- The repo checked out at the workspace root
- (For data migration) the Railway PostgreSQL **public** connection URL

---

## 2. Start the stack

```bash
# from the workspace root (the folder containing docker-compose.yml)
docker compose up -d --build
```

Then open:

| Service | URL |
|---|---|
| Website | http://localhost:3000 |
| API | http://localhost:8002 |
| API docs | http://localhost:8002/docs (only when `DEBUG=true`) |
| Health | http://localhost:8002/health |

The backend container waits for Postgres, runs `alembic upgrade head`, then
starts Gunicorn/Uvicorn. On first boot it also seeds the admin/super-admin users from
`backend/.env`.

Useful commands:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose ps
docker compose down          # stop, keep data
docker compose down -v       # stop and DELETE database/uploads/redis data
```

---

## 3. Copy your Railway settings

The app needs the secrets that used to live in Railway → Backend → Variables.
Open `backend/.env` and fill in the values you use:

| Variable | Notes |
|---|---|
| `RESEND_API_KEY` | Email sending |
| `RESEND_FROM_EMAIL` | Verified sender |
| `EMAIL_FROM` | Admin notification recipient |
| `PESAPAL_CONSUMER_KEY` / `PESAPAL_CONSUMER_SECRET` | Payments |
| `PESAPAL_ENVIRONMENT` | `sandbox` or `live` |
| `CLOUDINARY_*` | Keep these if images live on Cloudinary |
| `AWS_*` | Keep these if images live on S3 |
| `SECRET_KEY` | Already generated locally; keep it stable |

> **Image storage:** if you leave `CLOUDINARY_*` and `AWS_*` empty,
> `ENVIRONMENT=development` makes uploads save to the local Docker volume
> (`uploads_data`). Existing Cloudinary/S3 URLs in the database keep working.

After editing `backend/.env`, restart the backend:

```bash
docker compose up -d backend
```

---

## 4. Migrate the Railway database

### 4.1 Get the connection string

Railway dashboard → your PostgreSQL service → **Connect** → copy the
**Public Network** URL (not the internal `*.railway.internal` one). It looks like:

```
postgresql://postgres:PASSWORD@roundhouse.proxy.rlwy.net:PORT/railway
```

Or with the Railway CLI:

```bash
railway link
railway variables --service Postgres
```

### 4.2 Dump and restore

The script uses Docker, so no local `pg_dump` install is needed:

```bash
RAILWAY_DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway" \
  ./scripts/migrate-from-railway.sh
```

What it does:

1. Saves a plain-SQL backup to `backups/railway_<timestamp>.sql`
2. Starts the local `db` container
3. Restores the dump (drops existing objects first)
4. Runs `alembic upgrade head` to apply any newer migrations
5. Checks whether the database references local `/uploads/*` files

If Railway's Postgres is a different major version, override the client image:

```bash
PG_IMAGE=postgres:16-alpine RAILWAY_DATABASE_URL="..." ./scripts/migrate-from-railway.sh
```

### 4.3 Migrate uploaded files (only if needed)

If uploads were stored on Railway's local disk (URLs starting with `/uploads/`),
the files must be copied separately. Railway's filesystem is ephemeral, so this
only works if the files still exist on a Railway volume.

**Option A — tarball (recommended):**

```bash
# With the Railway CLI, from the repo root:
railway link
railway ssh --service backend "tar czf - -C /app/static/uploads ." > uploads.tar.gz

# Then import it into the local Docker volume:
RAILWAY_UPLOADS_TARBALL="$PWD/uploads.tar.gz" SKIP_DB=1 \
  ./scripts/migrate-from-railway.sh
```

**Option B — let the script fetch it via Railway CLI:**

```bash
railway link
RAILWAY_SERVICE=backend SKIP_DB=1 ./scripts/migrate-from-railway.sh
```

If the check reports **0** local `/uploads/*` rows, there is nothing to copy —
the database points at Cloudinary/S3 URLs and those keep working.

---

## 5. Running without Docker (optional)

Start Postgres and Redis from the compose file, then run natively:

```bash
docker compose up -d db redis

cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# point DATABASE_URL/REDIS_URL at localhost:5435 / localhost:6381 in .env
alembic upgrade head
uvicorn app.main:app --reload --port 8002

cd ../frontend
npm install
npm run dev        # http://localhost:5173, proxies /api/v1 → localhost:8002
```

---

## 6. Domain / SEO settings

Local defaults are already safe:

| Variable | Where | Local value |
|---|---|---|
| `ENABLE_CANONICAL_REDIRECTS` | backend + frontend | `false` |
| `SITE_URL` | frontend | unset → request host is used |
| `PRODUCTION_DOMAIN` | backend | `nelsontoursandsafaris.com` (unused while redirects are off) |
| `VITE_API_URL` | frontend | `http://localhost:8002/api/v1` |

If you later put this behind a real domain and want the old
www→non-www / Railway→production 301 behaviour:

```yaml
# docker-compose.yml → frontend.environment
SITE_URL: https://yourdomain.com
ENABLE_CANONICAL_REDIRECTS: "true"

# docker-compose.yml → backend.environment
ENABLE_CANONICAL_REDIRECTS: "true"
PRODUCTION_DOMAIN: yourdomain.com
```

Also update `ALLOWED_ORIGINS` on the backend to your frontend origin.

---

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| Frontend loads but API calls fail | Check `docker compose logs backend`; verify `VITE_API_URL=http://localhost:8002/api/v1` |
| `CORS error` | `ALLOWED_ORIGINS` must include the exact browser origin (`http://localhost:3000`) |
| Redirected to `nelsontoursandsafaris.com` | Set `ENABLE_CANONICAL_REDIRECTS=false` on **both** backend and frontend |
| `REDIS_URL must be set in production` | Keep `ENVIRONMENT=development` locally (compose already does), or set `REDIS_URL` |
| `relation ... does not exist` | Restore the DB again or run `docker compose run --rm backend alembic upgrade head` |
| Uploads return 503 | Either configure `CLOUDINARY_*`/`AWS_*`, or use `ENVIRONMENT=development` for local disk |
| Images 404 after migration | Import the `/uploads` files with the script in section 4.3 |
| Port already in use | Change host ports in `docker-compose.yml` (8002, 3000, 5435, 6381) |

---

## 8. What changed vs. Railway

- Added root `docker-compose.yml` (Postgres + Redis + backend + frontend).
- Added `frontend/Dockerfile` (Vite build + Node static/SSR-metadata server).
- Canonical redirects are now opt-in (`ENABLE_CANONICAL_REDIRECTS`), so localhost
  and LAN hosts are never bounced to the production domain.
- `SITE_URL` / `PRODUCTION_DOMAIN` are configurable instead of hardcoded.
- The inline production redirect moved to `frontend/public/redirect.js` on the
  `development` branch; it now skips localhost/LAN hosts.
- Frontend `server.js` can proxy `sitemap.xml`/`robots.txt` to an internal
  backend host (`BACKEND_INTERNAL_URL=http://backend:8000`).
- Uploads persist in the `uploads_data` Docker volume.
- `scripts/migrate-from-railway.sh` handles DB dump/restore and uploads.
- `railway.toml` files are no longer used by the local stack (left in place,
  harmless).
