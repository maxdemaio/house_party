from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response

class RoomView(generics.ListAPIView):
    """ Return all rooms """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    """ Return requested room """
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        # Grab code from frontend request '?code=...'
        code = request.GET.get(self.lookup_url_kwarg)

        # Make sure we have a room code
        if code != None:
            # Get room queryset from database
            room = Room.objects.filter(code=code)

            # Make sure code is valid
            if len(room) > 0:
                # Serialize room and take data (python dict)
                data = RoomSerializer(room[0]).data
                # Set boolean in data if user is the host
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_404_NOT_FOUND)


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    """ Have a user to join a room """
    def post(self, request, format=None):
        # Create session
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                # This user's session is in this room
                # We store the room code they're in server side
                self.request.session['room_code'] = code
                return Response({'message': 'Room Joined!'}, status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid room code'}, status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Invalid post data, did not find code key'}, status=HTTP_404_NOT_FOUND)


class CreateRoom(APIView):
    """ Create Room """
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        # Check memory for session of host
        if not self.request.session.exists(self.request.session.session_key):
            # Create session
            self.request.session.create()
        
        # Take POST request data, serialize, and get native Python datatypes
        # Form-like validation on request.data and create row in our database
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key

            # Check rooms already made by host
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                # Update their active room with new post request.data
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                # We store the room code they're the host of server side
                self.request.session['room_code'] = room.code
            else:
                # No previous rooms made by host, make new row in DB
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                # We store the room code they're the host of server side
                self.request.session['room_code'] = room.code
            
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
