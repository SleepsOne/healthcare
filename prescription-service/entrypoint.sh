#!/bin/sh
echo "[Entrypoint] Waiting for Postgres…"
until nc -z db 5432; do sleep 1; done
echo "[Entrypoint] Postgres ready"

echo "[Entrypoint] Applying migrations…"
python manage.py makemigrations --noinput
python manage.py migrate        --noinput
echo "[Entrypoint] Migrations done"

echo "[Entrypoint] Starting server…"
exec python manage.py runserver 0.0.0.0:8005
