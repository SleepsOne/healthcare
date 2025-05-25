from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        # Đảm bảo 'password' có trong list này
        fields = ['id', 'username', 'password', 'full_name', 'email', 'dob']
        read_only_fields = ['id']

    def create(self, validated_data):
        pwd = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(pwd)
        user.save()
        return user
