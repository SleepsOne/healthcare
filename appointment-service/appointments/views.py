from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Appointment
from .serializers import AppointmentSerializer
import pika
import os
import json
import requests


def send_appointment_notification(appointment, patient_email, doctor_email):
    credentials = pika.PlainCredentials(
        os.getenv('RABBITMQ_USER'), os.getenv('RABBITMQ_PASS'))
    params = pika.ConnectionParameters(
        host=os.getenv('RABBITMQ_HOST'),
        port=int(os.getenv('RABBITMQ_PORT')),
        credentials=credentials
    )
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    exchange = 'appointment'
    channel.exchange_declare(
        exchange=exchange, exchange_type='topic', durable=True)
    message = {
        "appointment_id": appointment.id,
        "patient_email": patient_email,
        "doctor_email": doctor_email,
        "message": f"Lịch hẹn của bạn vào {appointment.scheduled_at} đã được xác nhận!"
    }
    print(f"Publishing message to RabbitMQ: {message}")
    channel.basic_publish(
        exchange=exchange,
        routing_key='appointment.created',
        body=json.dumps(message)
    )
    connection.close()


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('-scheduled_at')
    serializer_class = AppointmentSerializer

    def create(self, request, *args, **kwargs):
        # Tạo appointment như bình thường
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()

        # Lấy email bệnh nhân và bác sĩ (giả sử truyền qua request, hoặc gọi sang service khác)
        patient_email = request.data.get('patient_email')
        doctor_email = request.data.get('doctor_email')

        # Nếu chưa có email, có thể gọi sang patient-service và doctor-service để lấy
        if not patient_email:
            token = request.headers.get('Authorization')
            headers = {'Authorization': token} if token else {}
            pid = appointment.patient_id
            r = requests.get(
                f'http://patient-service:8001/api/v1/patients/{pid}/', headers=headers)
            if r.ok:
                patient_email = r.json().get('user_profile', {}).get('email')

        if not doctor_email:
            token = request.headers.get('Authorization')
            headers = {'Authorization': token} if token else {}
            did = appointment.doctor_id
            r = requests.get(
                f'http://user-service:8000/api/v1/users/{did}/', headers=headers)
            if r.ok:
                doctor_email = r.json().get('email')

        if patient_email or doctor_email:
            send_appointment_notification(
                appointment, patient_email, doctor_email)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
