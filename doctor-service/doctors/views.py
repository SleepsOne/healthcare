from rest_framework import viewsets
from .models import Doctor
from .serializers import DoctorSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by('-created_at')
    serializer_class = DoctorSerializer
