#!/bin/sh
export DJANGO_SETTINGS_MODULE=notification_service.settings
echo "Waiting for Postgres…"
until nc -z db 5432; do sleep 1; done

echo "Waiting for RabbitMQ…"
until nc -z rabbitmq 5672; do sleep 1; done

echo "Running migrations…"
python manage.py makemigrations notifications --noinput
python manage.py migrate --noinput

echo "Starting consumer…"
python -m notifications.consumer
