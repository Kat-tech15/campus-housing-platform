from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import string

def generate_verification_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6)) 

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('house_owner', 'House Owner'),
        ('student', 'Student'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)    
    email_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=6, editable=False, default=generate_verification_code)

    def __str__(self):
        return self.username