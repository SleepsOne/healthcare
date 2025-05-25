#!/bin/sh
echo "Waiting for Postgres…"
until nc -z db 5432; do sleep 1; done

echo "Makemigrations & Migrate…"
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Starting Django on :8003"
exec python manage.py runserver 0.0.0.0:8003 --noreload
