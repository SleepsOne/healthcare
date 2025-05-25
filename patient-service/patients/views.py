from rest_framework import viewsets
from rest_framework.response import Response
from .models import Patient
from .serializers import PatientSerializer
import requests


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by("-created_at")
    serializer_class = PatientSerializer

    def retrieve(self, request, *args, **kwargs):
        patient = self.get_object()
        data = self.get_serializer(patient).data
        # Gộp thêm thông tin user profile
        headers = {}
        auth = request.headers.get("Authorization")
        if auth:
            headers["Authorization"] = auth
        r = requests.get(
            f"http://user-service:8000/api/v1/users/{patient.user_id}/",
            headers=headers,
        )
        if r.ok:
            data["user_profile"] = r.json()
        return Response(data)
