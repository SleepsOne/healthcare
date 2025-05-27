from rest_framework import viewsets
from .models import Medication, Order, OrderItem
from .serializers import MedicationSerializer, OrderSerializer, OrderItemSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('created_at')
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.id)

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        # validate choice
        valid = dict(Order._meta.get_field('status').choices).keys()
        if new_status not in valid:
            return Response(
                {'detail': 'Invalid status'},
                status=400
            )
        order.status = new_status
        order.save()
        return Response({'status': order.status})


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
