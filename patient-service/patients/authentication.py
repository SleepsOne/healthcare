# patient-service/patients/authentication.py
import requests
from types import SimpleNamespace
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings


class RemoteJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token[api_settings.USER_ID_CLAIM]
        resp = requests.get(
            f"http://user-service:8000/api/v1/users/{user_id}/",
            headers={'Authorization': f"Bearer {validated_token}"}
        )
        if not resp.ok:
            raise exceptions.AuthenticationFailed('User not found or inactive')
        data = resp.json()
        # Tạo một object “vớ” user mà không lưu vào DB
        user = SimpleNamespace(**data)
        user.is_authenticated = True
        return user
