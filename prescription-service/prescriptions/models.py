# prescriptions/models.py
from django.db import models

class Prescription(models.Model):
    appointment_id = models.PositiveIntegerField()
    patient_id     = models.PositiveIntegerField()
    doctor_id      = models.PositiveIntegerField()
    issued_at      = models.DateTimeField(auto_now_add=True)
    notes          = models.TextField(blank=True)

    def __str__(self):
        return f"Prescription#{self.id}"

class PrescriptionItem(models.Model):
    prescription   = models.ForeignKey(Prescription, related_name="items", on_delete=models.CASCADE)
    medication     = models.CharField(max_length=255)
    dosage         = models.CharField(max_length=100)
    duration_days  = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.medication} x{self.duration_days}d"
