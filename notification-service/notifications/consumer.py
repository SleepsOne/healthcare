# fmt: off
import os
import django

# Thiết lập Django environment để dùng ORM
os.environ.setdefault('DJANGO_SETTINGS_MODULE',
                      'notification_service.settings')
django.setup()


import json
import pika
from django.utils import timezone
from notifications.models import Notification
from django.conf import settings
from django.core.mail import send_mail# Đọc config từ env


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
channel.exchange_declare(
    exchange=exchange, exchange_type='topic', durable=True)
queue = 'notification_queue'
channel.queue_declare(queue=queue, durable=True)
# binding tất cả event appointment.*
channel.queue_bind(queue=queue, exchange=exchange, routing_key='appointment.*')

print('[*] Waiting for messages. To exit press CTRL+C')


def callback(ch, method, properties, body):
    data = json.loads(body)
    event = method.routing_key  # ví dụ 'appointment.created'
    notif = Notification.objects.create(
        event_type=event,
        payload=data,
        status='pending'
    )
    try:
        # Ví dụ: gửi email (giả sử payload có patient_email, doctor_email, message)
        subject = f"Notification: {event}"
        message = data.get('message', json.dumps(data))
        recipient = data.get('patient_email')
        send_mail(subject, message, settings.SMTP_USER,
                  [recipient], fail_silently=False)
        notif.status = 'sent'
    except Exception as e:
        print('Error sending:', e)
        notif.status = 'failed'
    notif.processed_at = timezone.now()
    notif.save()
    ch.basic_ack(delivery_tag=method.delivery_tag)


channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue=queue, on_message_callback=callback)
channel.start_consuming()
