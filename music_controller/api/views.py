from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.
class RoomView(generics.ListAPIView):
    """ Return all rooms """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class CreateRoom(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        # Check memory for session of host
        if not self.request.session.exists(self.request.session.session_key):
            # Create session
            self.request.session.create()
        # Take POST request data, serialize and get native Python datatypes
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            # Check rooms already made by host
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                # Update their active room with new post data
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
            
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
