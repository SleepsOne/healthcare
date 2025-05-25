# fmt: off
import os
import django

# Thiết lập Django environment để dùng ORM
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notification_service.settings')
django.setup()

import json
import pika
from django.utils import timezone
from notifications.models import Notification
from django.conf import settings
from django.core.mail import send_mail

RABBIT_HOST = os.getenv('RABBITMQ_HOST')
RABBIT_PORT = int(os.getenv('RABBITMQ_PORT'))
RABBIT_USER = os.getenv('RABBITMQ_USER')
RABBIT_PASS = os.getenv('RABBITMQ_PASS')

# Kết nối RabbitMQ
credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
params = pika.ConnectionParameters(
    host=RABBIT_HOST, port=RABBIT_PORT, credentials=credentials)
connection = pika.BlockingConnection(params)
channel = connection.channel()

# Tạo exchange & queue
exchange = 'appointment'
channel.exchange_declare(exchange=exchange, exchange_type='topic', durable=True)
queue = 'notification_queue'
channel.queue_declare(queue=queue, durable=True)
channel.queue_bind(queue=queue, exchange=exchange, routing_key='appointment.*')

print('[*] Waiting for messages. To exit press CTRL+C', flush=True)

def callback(ch, method, properties, body):
    print(f"[*] Received message: {body}", flush=True)
    try:
        data = json.loads(body)
        print(f"[*] Parsed data: {data}", flush=True)
        event = method.routing_key
        notif = Notification.objects.create(
            event_type=event,
            payload=data,
            status='pending'
        )
        subject = f"Notification: {event}"
        message = data.get('message', json.dumps(data))
        recipients = []
        if data.get('patient_email'):
            recipients.append(data['patient_email'])
        if data.get('doctor_email'):
            recipients.append(data['doctor_email'])
        if recipients:
            print(f"[*] Sending mail to: {recipients} | Subject: {subject}", flush=True)
            send_mail(subject, message, settings.EMAIL_HOST_USER, recipients, fail_silently=False)
            print("[*] Mail sent successfully.", flush=True)
            notif.status = 'sent'
        else:
            print("[!] No recipient email found in message.", flush=True)
            notif.status = 'failed'
        notif.processed_at = timezone.now()
        notif.save()
    except Exception as e:
        print(f'[!] Error in callback: {e}', flush=True)
    finally:
        ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue=queue, on_message_callback=callback)
channel.start_consuming()