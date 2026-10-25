#!/usr/bin/env bash
#
# Migrate the Railway PostgreSQL database (and optionally local uploads)
# into the local Docker Compose stack.
#
# Usage:
#   RAILWAY_DATABASE_URL="postgresql://postgres:PASS@HOST:PORT/railway" \
#     ./scripts/migrate-from-railway.sh
#
# Optional:
#   RAILWAY_UPLOADS_TARBALL=/path/to/uploads.tar.gz  copy a tarball of uploads
#   RAILWAY_SERVICE=backend                          use Railway CLI to fetch uploads
#   SKIP_DB=1                                        skip the database dump/restore
#   SKIP_UPLOADS=1                                   skip uploads
#   LOCAL_DB_NAME / LOCAL_DB_USER / LOCAL_DB_PASSWORD / LOCAL_DB_PORT
#   PG_IMAGE=postgres:17-alpine                      pg_dump/psql client image
#
# The dump is a plain SQL file (portable across Postgres major versions).
# It is saved under backups/ before anything is restored.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

LOCAL_DB_NAME="${LOCAL_DB_NAME:-nelson_tour_safari}"
LOCAL_DB_USER="${LOCAL_DB_USER:-postgres}"
LOCAL_DB_PASSWORD="${LOCAL_DB_PASSWORD:-password}"
LOCAL_DB_HOST="${LOCAL_DB_HOST:-db}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-5432}"
PG_IMAGE="${PG_IMAGE:-postgres:17-alpine}"
STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p backups

run_psql() {
  docker run --rm \
    --network "$NETWORK" \
    -e PGPASSWORD="$LOCAL_DB_PASSWORD" \
    "$PG_IMAGE" \
    psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" "$@"
}

wait_for_db() {
  echo "==> Starting local database..."
  docker compose up -d db
  for _ in $(seq 1 60); do
    if [ "$(docker inspect -f '{{.State.Health.Status}}' nelson_db 2>/dev/null || true)" = "healthy" ]; then
      return 0
    fi
    sleep 2
  done
  echo "ERROR: local database did not become healthy." >&2
  exit 1
}

# ── 1. Database ──────────────────────────────────────────────────────────────
if [ "${SKIP_DB:-0}" != "1" ]; then
  : "${RAILWAY_DATABASE_URL:?Set RAILWAY_DATABASE_URL to the Railway Postgres public URL}"

  DUMP_NAME="railway_${STAMP}.sql"

  echo "==> Dumping Railway database..."
  docker run --rm \
    -v "$ROOT_DIR/backups:/backups" \
    -e PGSSLMODE="${RAILWAY_PGSSLMODE:-prefer}" \
    "$PG_IMAGE" \
    pg_dump "$RAILWAY_DATABASE_URL" \
      --no-owner --no-privileges --clean --if-exists \
      --format=plain --file="/backups/${DUMP_NAME}"

  echo "==> Dump saved to backups/${DUMP_NAME}"

  wait_for_db
  NETWORK="$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' nelson_db)"

  echo "==> Restoring into local database '${LOCAL_DB_NAME}'..."
  run_psql -v ON_ERROR_STOP=1 -f "/backups/${DUMP_NAME}"

  echo "==> Applying any newer migrations..."
  docker compose run --rm --no-deps backend alembic upgrade head

  echo "==> Database migration complete."
else
  wait_for_db
  NETWORK="$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' nelson_db)"
fi

# ── 2. Uploaded files ────────────────────────────────────────────────────────
if [ "${SKIP_UPLOADS:-0}" != "1" ]; then
  LOCAL_UPLOAD_COUNT="$(run_psql -tAc "
    SELECT count(*) FROM (
      SELECT url FROM media WHERE url LIKE '/uploads/%'
      UNION ALL SELECT url FROM tour_images WHERE url LIKE '/uploads/%'
      UNION ALL SELECT url FROM route_images WHERE url LIKE '/uploads/%'
      UNION ALL SELECT image_url FROM experiences WHERE image_url LIKE '/uploads/%'
    ) refs
  " 2>/dev/null || echo "0")"
  LOCAL_UPLOAD_COUNT="$(echo "$LOCAL_UPLOAD_COUNT" | tr -d '[:space:]')"

  if [ "${LOCAL_UPLOAD_COUNT:-0}" = "0" ]; then
    echo "==> No local /uploads/* files referenced by the database — nothing to copy."
    echo "    (Images served from Cloudinary/S3 keep working as-is.)"
  elif [ -n "${RAILWAY_UPLOADS_TARBALL:-}" ]; then
    if [ ! -f "$RAILWAY_UPLOADS_TARBALL" ]; then
      echo "ERROR: RAILWAY_UPLOADS_TARBALL does not exist: $RAILWAY_UPLOADS_TARBALL" >&2
      exit 1
    fi
    VOLUME_NAME="$(docker volume ls --format '{{.Name}}' | grep -E 'uploads_data$' | head -n1)"
    if [ -z "$VOLUME_NAME" ]; then
      echo "ERROR: could not find the uploads Docker volume. Start the stack once first." >&2
      exit 1
    fi
    echo "==> Extracting uploads into volume ${VOLUME_NAME}..."
    docker run --rm \
      -v "${VOLUME_NAME}:/target" \
      -v "$(cd "$(dirname "$RAILWAY_UPLOADS_TARBALL")" && pwd):/src:ro" \
      alpine:3.20 \
      sh -c "tar xzf '/src/$(basename "$RAILWAY_UPLOADS_TARBALL")' -C /target"
    echo "==> Uploads restored."
  elif command -v railway >/dev/null 2>&1 && [ -n "${RAILWAY_SERVICE:-}" ]; then
    UPLOADS_NAME="railway_uploads_${STAMP}.tar.gz"
    echo "==> Fetching uploads from Railway service '${RAILWAY_SERVICE}'..."
    railway ssh --service "$RAILWAY_SERVICE" "tar czf - -C /app/static/uploads ." \
      > "backups/${UPLOADS_NAME}"
    VOLUME_NAME="$(docker volume ls --format '{{.Name}}' | grep -E 'uploads_data$' | head -n1)"
    if [ -z "$VOLUME_NAME" ]; then
      echo "ERROR: could not find the uploads Docker volume. Start the stack once first." >&2
      exit 1
    fi
    docker run --rm \
      -v "${VOLUME_NAME}:/target" \
      -v "$ROOT_DIR/backups:/src:ro" \
      alpine:3.20 \
      sh -c "tar xzf '/src/${UPLOADS_NAME}' -C /target"
    echo "==> Uploads restored from Railway."
  else
    echo "WARNING: the database references ${LOCAL_UPLOAD_COUNT} local /uploads/* file(s),"
    echo "         but no uploads source was provided."
    echo "         Re-run with RAILWAY_UPLOADS_TARBALL=/path/to/uploads.tar.gz"
    echo "         (or install the Railway CLI and set RAILWAY_SERVICE=backend)."
    echo "         See LOCAL_HOSTING.md for how to create the tarball."
  fi
fi

echo
echo "==> Done. Start the full stack with:"
echo "    docker compose up -d"
echo "    Frontend: http://localhost:3000"
echo "    API docs: http://localhost:8002/docs"
