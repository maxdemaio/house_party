from django.urls import path
from .views import RoomView, CreateRoom

urlpatterns = [
    path('room', RoomView.as_view()),
    path('create-room', CreateRoom.as_view())
]