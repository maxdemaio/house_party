from django.urls import path
from .views import index

# Requirement so we can redirect here by name
app_name = 'frontend'

urlpatterns = [
    path('', index, name=""),
    path('join', index),
    path('create', index),
    path('room/<str:roomCode>', index)
]
