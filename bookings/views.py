from rest_framework import generics, mixins
from .serializers import BookingSerializer
from drf_spectacular.utils import extend_schema
from .models import Booking


@extend_schema(tags=['Bookings'])
class BookingListCreateView(mixins.CreateModelMixin,mixins.ListModelMixin, generics.GenericAPIView):
    serializer_class = BookingSerializer
    queryset = Booking.objects.all()

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)
    
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


@extend_schema(tags=['Booking'])   
class BookingDetailView(mixins.RetrieveModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      generics.GenericAPIView):
    
    serializer_class = BookingSerializer
    queryset = Booking.objects.all()

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
    
    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)