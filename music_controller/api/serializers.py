"""
Take our Room model and translate
into a JSON response for our React frontend
"""

from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    # Incoming request
    class Meta:
        model = Room
        fields = ('id', 'code', 'host',
            'guest_can_pause', 'votes_to_skip')

class CreateRoomSerializer(serializers.ModelSerializer):
    # Serialize request 'createroom' moreso outgoing
    # Make sure POST request data is valid to Model fields
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')


class UpdateRoomSerializer(serializers.ModelSerializer):
    # Make sure no error with unique room codes
    # If unique is true, it won't let us pass a code that's not unique
    # To the serializer, so we re-define it
    # code now references this field
    code = serializers.CharField(validators=[])

    # Serialize request 'updateroom' moreso outgoing
    # Make sure patch request data is valid to Model fields
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')
