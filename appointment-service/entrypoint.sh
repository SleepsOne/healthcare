#!/bin/sh
echo "Waiting for Postgres…"
until nc -z db 5432; do sleep 1; done

echo "Running migrations…"
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Starting Django on :8002"
exec python manage.py runserver 0.0.0.0:8002 --noreload
