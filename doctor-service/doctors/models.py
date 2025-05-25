from django.db import models


class Doctor(models.Model):
    user_id = models.PositiveIntegerField(unique=True)
    specialty = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr.{self.user_id} – {self.specialty}"
