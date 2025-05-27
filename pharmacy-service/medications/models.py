from django.db import models

class Medication(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    dosage_form = models.CharField(max_length=100)  # tablet, syrup...
    strength = models.CharField(max_length=50)      # e.g. "500mg"
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.strength})"

class Order(models.Model):
    prescription_id = models.PositiveIntegerField()
    patient_id = models.PositiveIntegerField()
    doctor_id = models.PositiveIntegerField()
    created_by = models.PositiveIntegerField()  # lấy từ token.user_id
    status = models.CharField(
        max_length=20,
        choices=[('pending','Pending'),('filled','Filled'),('cancelled','Cancelled')],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
class OrderItem(models.Model):  
    order      = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    medication = models.CharField(max_length=255)
    dosage     = models.CharField(max_length=100)
    quantity   = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.medication} x{self.quantity}"