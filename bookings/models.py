from django.db import models
from accounts.models import CustomUser
from houses.models import House


class Booking(models.Model):
    client = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    house =  models.ForeignKey(House, on_delete=models.CASCADE, related_name='bookings')
    entry_date = models.DateTimeField()

    