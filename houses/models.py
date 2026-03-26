from django.db import models
from accounts.models import CustomUser


HOUSE_CHOICES = (
    ('single_room', 'Single Room'),
    ('double_room', 'Double Room'),
    ('bedsitter', 'Bedsitter'),
    ('one_bedroom', 'One Bedroom')
)
OWNER_CHOICES = (
    ('landlord', 'Landlord'),
    ('agent', 'Agent')
)

class House(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=HOUSE_CHOICES, default='single_room')
    managed_by = models.CharField(max_length=20, choices=OWNER_CHOICES, default='landlord')
    location = models.CharField(max_length=50)
    image = models.ImageField(upload_to='houses/images', blank=True, null=True)
    deposit_required = models.BooleanField(default=True)
    emenities = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.type} - {self.location}"