from rest_framework import serializers
from .models import Appointment
import requests


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'patient_id', 'doctor_id',
                  'scheduled_at', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_patient_id(self, pid):
        # Gọi Patient Service để kiểm tra existence
        token = self.context['request'].headers.get('Authorization')
        headers = {'Authorization': token} if token else {}
        r = requests.get(
            f"http://patient-service:8001/api/v1/patients/{pid}/", headers=headers)
        if r.status_code == 404:
            raise serializers.ValidationError("Patient không tồn tại")
        if not r.ok:
            raise serializers.ValidationError("Không thể xác minh Patient")
        return pid

    def validate_doctor_id(self, did):
        # Gọi User Service (Doctor) để kiểm tra existence
        token = self.context['request'].headers.get('Authorization')
        headers = {'Authorization': token} if token else {}
        r = requests.get(
            f"http://user-service:8000/api/v1/users/{did}/", headers=headers)
        if r.status_code == 404:
            raise serializers.ValidationError("Doctor không tồn tại")
        if not r.ok:
            raise serializers.ValidationError("Không thể xác minh Doctor")
        return did
