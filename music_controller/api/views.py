from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse


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
    """ Have a user to join a room """
    lookup_url_kwarg = 'code'

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


class UserInRoom(APIView):
    """Endpoint to check if current user (with session) is in a room
        This way when a user re-visits the home page
        they are directed to their room"""
    def get(self, request, format=None):
        # Check memory for session of host
        if not self.request.session.exists(self.request.session.session_key):
            # Create session
            self.request.session.create()
        data = {
            'code': self.request.session.get('room_code')
        }

        # Serialize our data
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    """Allow user to leave current room they are in"""
    def post(self, request, format=None):
        # Remove code from user's session
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            # Check if that user was a host
            # Obtain their session key and check if they are a host 
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            # Delete that room if the host leaves it
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    """Update votes to skip / guest can pause"""
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # Pass data into serializer
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # Obtain data if valid
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            # Find room with that code
            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({"Message": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
            room = queryset[0]
            user_id = self.request.session.session_key
            # Check if they are the host
            if room.host != user_id:
                return Response({"Message": "You are not the host of this room."}, status=status.HTTP_403_FORBIDDEN)
            # Update room
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({"Bad Request": "Invalid Data"}, status=status.HTTP_404_BAD_REQUEST)
