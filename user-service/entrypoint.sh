#!/bin/sh
echo "Waiting for postgres at db:5432…"
until nc -z db 5432; do sleep 1; done

echo "Postgres is available — running migrations"
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Starting Django"
exec python manage.py runserver 0.0.0.0:8000 --noreload
