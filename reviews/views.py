from rest_framework import generics
from .serializers import ReviewSerializer
from .models import Review

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    queryset  = Review.objects.all()
    