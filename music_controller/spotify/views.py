from django.shortcuts import render
from .credentials import REDIRECT_URI, SPOTIFY_CLIENTSECRET, SPOTIFY_CLIENTID
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post
from .util import update_or_create_user_tokens, is_spotify_authenticated
from django.shortcuts import redirect


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