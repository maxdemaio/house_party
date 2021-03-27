from django.shortcuts import render
from .credentials import REDIRECT_URI, SPOTIFY_CLIENTSECRET, SPOTIFY_CLIENTID
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post
from .util import *
from django.shortcuts import redirect



# Import Room model for now to delete room
from django.apps import apps
Room = apps.get_model('api', 'Room')


class AuthURL(APIView):
    """Return URL we can use to authenticate our application"""
    def get(self, request, format=None):
        # What we want to do with our application
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        # URL to request authorization
        url = Request('GET', 'https://accounts.spotify.com/authorize',
            params = {
                'scope': scopes,
                'response_type': 'code',
                'redirect_uri': REDIRECT_URI,
                'client_id': SPOTIFY_CLIENTID,
            }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    """Get code / state after access authorized
        obtain access/refresh token"""
    code = request.GET.get('code')
    # Print out error if we are receiving one
    error = request.GET.get('error')

    # User cancels or the Spotify access was denied
    if error == "access_denied":
        # TODO display an error and allow them to try and re-authenticate
        # For now: Remove code from user's session
        if 'room_code' in request.session:
            request.session.pop('room_code')
            # Check if that user was a host
            # Obtain their session key and check if they are a host
            host_id = request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            # Delete that room if the host leaves it
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()
        return redirect("frontend:")

    # Callback request
    response = post('https://accounts.spotify.com/api/token',
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': REDIRECT_URI,
            'client_id': SPOTIFY_CLIENTID,
            'client_secret': SPOTIFY_CLIENTSECRET
        }).json()

    # Obtain access/refresh token
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')
    
    # Create session
    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    # Redirect back to frontend
    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        """Call util function and check if authenticated, return JSON"""
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        """Return information about currently playing song"""
        # Use room code to figure who host/guests are
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status.status.HTTP_404_NOT_FOUND)

        host = room.host
        endpoint = "player/currently-playing"

        # Session ID (host), with endpoint
        response = execute_spotify_api_request(host, endpoint)
        print(response)
        
        # No song information error from request
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        # Clean up artist / multiple artists
        artist_string = ""
        for index, artist in enumerate(item.get('artists')):
            if index > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name

        # All song information to send to the frontend
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': 0,
            'id': song_id
        }

        return Response(song, status=status.HTTP_200_OK)


class PauseSong(APIView):
    def put(self, response, format=None):
        """Update state of song to be paused, make sure permission is allowed"""
        # Use room code to figure who host/guests are
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response({}, status.status.HTTP_404_NOT_FOUND)

        # Check if pause available for host/guest
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({"Message": "Song paused"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"Message": "Pausing not allowed"}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    def put(self, response, format=None):
        """Update state of song to be paused, make sure permission is allowed"""
        # Use room code to figure who host/guests are
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response({}, status.status.HTTP_404_NOT_FOUND)

        # Check if pause available for host/guest
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({"Message": "Song paused"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"Message": "Pausing not allowed"}, status=status.HTTP_403_FORBIDDEN)
