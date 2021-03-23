from django.shortcuts import render
from .credentials import REDIRECT_URI, SPOTIFY_CLIENTSECRET, SPOTIFY_CLIENTID
from rest_framework.views import APIView
from requests import Request, post

class AuthURL(APIView):
    """Authenticate application to access a user's Spotify data"""
    def get(self, request, format=None):
        
        scopes = ''