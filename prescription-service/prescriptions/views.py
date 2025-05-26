from rest_framework import viewsets
from .models import Prescription
from .serializers import PrescriptionSerializer

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all().order_by('-issued_at')
    serializer_class = PrescriptionSerializer

    def perform_create(self, serializer):
        print("[ViewSet] perform_create() start")
        pres = serializer.save()
        print(f"[ViewSet] perform_create() done → Prescription#{pres.id}")
