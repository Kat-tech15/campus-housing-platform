from django.urls import path
from .views import BookingListCreateView, BookingDetailView


urlpatterns = [
    path('list/', BookingListCreateView.as_view(), name='list-booking'),
    path('detail/<int:pk>/', BookingDetailView.as_view(), name='booking-detail')
]