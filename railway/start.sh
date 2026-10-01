#!/bin/sh
set -eu

: "${PORT:=8080}"

# If Railway has a Volume mounted at /data, use it automatically.
# If DATABASE_URL is supplied, Django uses PostgreSQL instead.
if [ -z "${DATABASE_URL:-}" ] && [ -d /data ] && [ -w /data ]; then
  export RAILWAY_VOLUME_MOUNT_PATH=/data
  mkdir -p /data/media
  if [ ! -f /data/db.sqlite3 ] && [ -f /app/db.sqlite3 ]; then
    echo "[InstaKids] First run: copying initial SQLite database to /data"
    cp /app/db.sqlite3 /data/db.sqlite3
  fi
fi

if [ -n "${DATABASE_URL:-}" ]; then
  echo "[InstaKids] Database: PostgreSQL"
else
  echo "[InstaKids] Database: SQLite (${RAILWAY_VOLUME_MOUNT_PATH:-/app})"
  if [ -z "${RAILWAY_VOLUME_MOUNT_PATH:-}" ]; then
    echo "[InstaKids] WARNING: no Railway Volume detected; SQLite data will be ephemeral."
  fi
fi

python manage.py migrate --noinput

# SQLite is kept to one worker to avoid multi-process write locks.
if [ -n "${DATABASE_URL:-}" ]; then
  WORKERS="${WEB_CONCURRENCY:-3}"
else
  WORKERS=1
fi

# Start Django first; nginx healthcheck will fail until Django is ready.
gunicorn config.wsgi:application \
  --bind 127.0.0.1:8000 \
  --worker-class gthread \
  --workers "$WORKERS" \
  --threads "${GUNICORN_THREADS:-32}" \
  --timeout 120 \
  --graceful-timeout 30 \
  --keep-alive 75 \
  --max-requests 2000 \
  --max-requests-jitter 200 \
  --access-logfile - \
  --error-logfile - &
GUNICORN_PID=$!

cleanup() {
  kill "$GUNICORN_PID" 2>/dev/null || true
  wait "$GUNICORN_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# Let nginx be the public process and keep the container alive.
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf
nginx -t
nginx -g 'daemon off;'
