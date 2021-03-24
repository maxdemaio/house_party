from django.shortcuts import render
from .credentials import REDIRECT_URI, SPOTIFY_CLIENTSECRET, SPOTIFY_CLIENTID
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post
from .util import update_or_create_user_tokens, is_spotify_authenticated
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
    error = request.GET.get('error')
    print(error)
    print(type(error))

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
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)
