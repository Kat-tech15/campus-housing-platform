from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import string
from django.conf import settings

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
    
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile'  )
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
