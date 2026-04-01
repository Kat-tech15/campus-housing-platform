from rest_framework import generics, permissions
from .serializers import ReviewSerializer
from drf_spectacular.utils import extend_schema
from .models import Review

@extend_schema(tags=['Reviews'])
class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    queryset  = Review.objects.all()
    permission_classes = [permissions.AllowAny]
    