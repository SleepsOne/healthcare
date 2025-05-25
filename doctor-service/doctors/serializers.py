from rest_framework import serializers
from .models import Doctor
import requests


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'user_id', 'specialty',
                  'bio', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_user_id(self, uid):
        # Gọi User Service để kiểm tra user tồn tại
        token = self.context['request'].headers.get('Authorization')
        headers = {'Authorization': token} if token else {}
        r = requests.get(
            f"http://user-service:8000/api/v1/users/{uid}/", headers=headers)
        if r.status_code == 404:
            raise serializers.ValidationError("User (Doctor) không tồn tại")
        if not r.ok:
            raise serializers.ValidationError(
                "Không thể xác minh User Service")
        return uid
