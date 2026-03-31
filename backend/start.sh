#!/bin/sh
set -e

echo "Starting Uvicorn..."
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" &
UVICORN_PID=$!

(
  echo "Waiting for database to become available..."
  python - <<'PY'
import os
import sys
import time

import psycopg2

database_url = os.environ.get("DATABASE_URL_SYNC") or os.environ.get("DATABASE_URL")
if not database_url:
    print("DATABASE_URL or DATABASE_URL_SYNC is missing", file=sys.stderr)
    sys.exit(1)

for attempt in range(1, 31):
    try:
        conn = psycopg2.connect(database_url)
        conn.close()
        print("Database is ready.")
        sys.exit(0)
    except Exception as exc:
        print(f"Database not ready (attempt {attempt}/30): {exc}")
        time.sleep(2)

print("Database did not become ready in time.", file=sys.stderr)
sys.exit(1)
PY

  echo "Running Alembic migrations..."
  alembic upgrade head || echo "Alembic migrations failed after startup; check logs"
) &

wait "$UVICORN_PID"
