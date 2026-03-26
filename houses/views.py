from rest_framework import generics, status, permissions
from .serializers import HouseSerializer
from drf_spectacular.utils import extend_schema
from .models import House

@extend_schema(tags=['Houses'])
class HouseListView(generics.ListCreateAPIView):
    serializer_class  = HouseSerializer
    queryset = House.objects.all()
    permission_classes = [permissions.AllowAny]


@extend_schema(tags=['Houses'])
class HouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HouseSerializer
    queryset = House
    permission_classes = [permissions.AllowAny]