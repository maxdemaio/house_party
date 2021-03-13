from django.urls import path
from .views import RoomView, CreateRoom, GetRoom, JoinRoom, UserInRoom

urlpatterns = [
    path('room', RoomView.as_view()),
    path('create-room', CreateRoom.as_view()),
    path('get-room', GetRoom.as_view()),
    path('join-room', JoinRoom.as_view()),
    path('user-in-room', UserInRoom.as_view())
]