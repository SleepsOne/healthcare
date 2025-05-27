from rest_framework import viewsets
from rest_framework.response import Response
from .models import Patient
from .serializers import PatientSerializer
import requests
from rest_framework import status,permissions
from rest_framework.decorators import action


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
    
    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            patient = Patient.objects.get(user_id=request.user.id)
        except Patient.DoesNotExist:
            return Response({"detail":"No patient record."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            return Response(self.get_serializer(patient).data)

        # PATCH
        serializer = self.get_serializer(patient, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
