from django.db import models


class Patient(models.Model):
    user_id = models.PositiveIntegerField(
        unique=True,
        null=True,    # cho phép NULL
        blank=True,   # cho phép trống ở form
        help_text="ID của User bên User Service"
    )
    medical_record = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    dob = models.DateField()
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} ({self.medical_record})"
