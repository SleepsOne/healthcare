
# medications/serializers.py
from rest_framework import serializers
from .models import Medication, Order, OrderItem
import requests

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['medication','dosage','quantity']
        extra_kwargs = {'quantity': {'required': True}}

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['created_by','created_at','updated_at']

    def create(self, validated_data):
        from django.db import transaction
        # Lấy created_by được merge vào validated_data từ serializer.save()
        created_by = validated_data.pop('created_by', None)
        items_data = validated_data.pop('items')
        pid = validated_data['prescription_id']

        # 1) fetch prescription
        resp = requests.get(
            f"http://prescription-service:8005/api/v1/prescriptions/{pid}/",
            headers={'Authorization': self.context['request'].headers.get('Authorization', '')}
        )
        if resp.status_code != 200:
            raise serializers.ValidationError("Prescription không tồn tại")
        prescription = resp.json()
        presc_items = prescription.get('items', [])

        # 2) kiểm tra stock
        for it in presc_items:
            med_name = it['medication']
            qty = it.get('quantity', 1)
            try:
                med = Medication.objects.get(name=med_name)
            except Medication.DoesNotExist:
                raise serializers.ValidationError(f"Medication '{med_name}' không tồn tại")
            if med.stock < qty:
                raise serializers.ValidationError(f"Không đủ stock cho {med_name}")

        # 3) tạo order + items trong atomic transaction
        with transaction.atomic():
            order = Order.objects.create(
                created_by=created_by,
                **validated_data
            )
            for it in presc_items:
                med = Medication.objects.get(name=it['medication'])
                qty = it.get('quantity', 1)
                med.stock -= qty
                med.save()
                OrderItem.objects.create(
                    order=order,
                    medication=it['medication'],
                    dosage=it['dosage'],
                    quantity=qty
                )
        return order

    def update(self, instance, validated_data):
        from django.db import transaction
        items_data = validated_data.pop('items', None)

        # update non-read-only fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            # restore stock from old items
            for old in instance.items.all():
                med = Medication.objects.get(name=old.medication)
                med.stock += old.quantity
                med.save()
            # delete old items
            instance.items.all().delete()

            # create new items
            with transaction.atomic():
                for it in items_data:
                    med = Medication.objects.get(name=it['medication'])
                    qty = it.get('quantity', 1)
                    if med.stock < qty:
                        raise serializers.ValidationError(f"Không đủ stock cho {it['medication']}")
                    med.stock -= qty
                    med.save()
                    OrderItem.objects.create(order=instance, **it)
        return instance
