from rest_framework import serializers
from .models import Patient
from django.conf import settings


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "user_id", "medical_record", "full_name",
                  "dob", "address", "phone", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
