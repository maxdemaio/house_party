from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.
class RoomView(generics.ListAPIView):
    """ Return all rooms """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
