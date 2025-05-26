# prescriptions/serializers.py
from rest_framework import serializers
from .models import Prescription, PrescriptionItem

class PrescriptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionItem
        fields = ['medication','dosage','duration_days']

class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True)

    class Meta:
        model = Prescription
        fields = ['id','appointment_id','patient_id','doctor_id','issued_at','notes','items']
        read_only_fields = ['id','issued_at']

    def create(self, validated_data):
        print("[Serializer] input validated_data:", validated_data)
        items_data = validated_data.pop('items')
        pres = Prescription.objects.create(**validated_data)
        print(f"[Serializer] created Prescription#{pres.id}")
        for item in items_data:
            print(f"[Serializer] creating item for Prescription#{pres.id} →", item)
            PrescriptionItem.objects.create(prescription=pres, **item)
        print(f"[Serializer] all items created for Prescription#{pres.id}")
        return pres
