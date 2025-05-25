from django.db import models


class Appointment(models.Model):
    patient_id = models.PositiveIntegerField()
    doctor_id = models.PositiveIntegerField()
    scheduled_at = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending',   'Pending'),
            ('confirmed', 'Confirmed'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appt #{self.id} (P{self.patient_id} → D{self.doctor_id} @ {self.scheduled_at})"
