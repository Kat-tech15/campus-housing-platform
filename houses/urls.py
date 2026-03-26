from django.urls import path
from .views import HouseListView, HouseDetailView


urlpatterns = [
    path('list/', HouseListView.as_view(), name='list-create'),
    path('int:<pk>/', HouseDetailView.as_view(), name='detail')
]