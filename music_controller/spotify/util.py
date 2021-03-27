from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import SPOTIFY_CLIENTID, SPOTIFY_CLIENTSECRET
from requests import post, put, get


# Base url for spotify api requests
BASE_URL = "https://api.spotify.com/v1/me/"


def get_user_tokens(session_id):
    """Check if any tokens exist for user"""
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    """Save token in model or update existing model with new tokens"""
    tokens = get_user_tokens(session_id)

    # Spotify tokens expire in 1 hour
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    # Update or create new row in db
    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token',
                                   'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token,
            refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()



def is_spotify_authenticated(session_id):
    """Check if token expired or doesn't exist"""
    # Tokens is our model object (contains main rows)
    tokens = get_user_tokens(session_id)

    # Check if tokens exists in our db for that user
    if tokens:
        expiry = tokens.expires_in
        # If curr expiry has passed, refresh the token
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)
        return True

    # Nothing from db so not authenticated (we don't have access to control their Spotify)
    return False


def refresh_spotify_token(session_id):
    """Refresh spotify token"""
    refresh_token = get_user_tokens(session_id).refresh_token

    response = post('https://accounts.spotify.com/api/token', data = {
        'grant_type': 'refresh_token',
        # Refresh token stays consistent for user throughout its life in DB
        'refresh_token': refresh_token,
        'client_id': SPOTIFY_CLIENTID,
        'client_secret': SPOTIFY_CLIENTSECRET
    }).json()

    # Our new access token for that user
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    # Update our database for that user
    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    """Make Spotify API request with host token and given endpoint"""
    tokens = get_user_tokens(session_id)

    # Structure request to Spotify API
    headers = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + tokens.access_token}

    if post_:
        post(BASE_URL + endpoint, headers=headers)
    if put_:
        put(BASE_URL + endpoint, headers=headers)

    response = get(BASE_URL + endpoint, {}, headers=headers)
    try:
        return response.json()
    except:
        print(response)
        # Note: 204 error will be returned if no song is playing
        return {'Error': 'Issue with request'}


def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", put_=True)


def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", put_=True)


def skip_song(session_id):
    return execute_spotify_api_request(session_id, "player/next", post_=True)