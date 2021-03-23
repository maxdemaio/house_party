# House Party
Collaborative music playing system built with React and Django

## Django REST backend

The API was constructed with the Django REST framework. With fetch calls from the frontend to the backend API (through the `api/` URLs) we can obtain create/read/update/delete room information.

## React frontend

The React frontend is located within a Django app called `frontend/`. Our project redirects any normal base URL to our `frontend/index.html` file (basically a Django template taken over by React) initially served through the `frontend/views.py` file. Afterwards, React Router setup handles how information is served and displayed to the client.

## Spotify API

![Spotify Auth Diagram](https://developer.spotify.com/assets/AuthG_AuthoriztionCode.png)

**Note:** within the `spotify/` Django app, make your own `credentials.py` file with the following variables after making your own application at [Spotify's Webiste](https://developer.spotify.com/dashboard/).

```
SPOTIFY_CLIENTID = ""
SPOTIFY_CLIENTSECRET = ""
REDIRECT_URI = ""
```

Overall here is a short explanation of how we can use Spotify's API:

    1. User can authenticate our application to access their data with certain scope

    2. After the user has logged in and granted authorization we obtain access/refresh tokens

    3. User access token to make requests to Spotify API

    4. After access token expires, we request a new one to continue interacting with the API 
