// Main landing page for a new room
import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ButtonAppBar from "./ButtonAppBar";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";


export default class Room extends Component{
    constructor(props){
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false,
            song: {
                title: 'No Song Currently Playing',
                artist: 'N/A',
                song: false,
            },
        };

        // Match prop stores how we got to this component from Router
        this.roomCode = this.props.match.params.roomCode;
        // Bind this to our functions so we can access it
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.renderSettingsButton = this.renderSettingsButton.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getCurrentSong = this.getCurrentSong.bind(this);

        // Call once everything is constructed
        // Starts with defaults and then gets populated
        this.getRoomDetails();
    }

    // Use short polling to check for updates
    // Call every one second
    componentDidMount() {
        this.interval = setInterval(this.getCurrentSong, 1000);
    }

    // Close interval on destruction of component
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getCurrentSong() {
        fetch("/spotify/current-song")
            .then((response) => {
                if (!response.ok) {
                    return {};
                } else {
                    return response.json();
                }
            })
            .then((data) => {
                this.setState({ song: data });
            });
    }


    authenticateSpotify() {
        // Send request to backend to check if current user is authenticated
        fetch("/spotify/is-authenticated")
            .then((response) => response.json())
            .then((data) => {
                this.setState({ spotifyAuthenticated: data.status });
                console.log("Spotify Authenticated?", data.status);

                // Host is not authenticated yet
                if (!data.status) {
                    fetch("/spotify/get-auth-url")
                        .then((response) => response.json())
                        .then((data) => {
                            // Redir to spotify auth page
                            // Afterwards our spotify callback function is called
                            window.location.replace(data.url);
                        });
                }
            });
    }


    getRoomDetails() {
        fetch('/api/get-room' + '?code=' + this.roomCode)
            // Make sure we get a valid response and update state
            .then((response) => {
                if (!response.ok) {
                    // Leave room if not valid
                    this.props.leaveRoomCallback();
                    this.props.push.history.push("/");
                }
                return response.json();
            })
            .then((data) => {
                this.setState({
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                })
                if (this.state.isHost) {
                    // Only send request if the user is a host of the room
                    // Wait until getRoomDetails has run (end of thens)
                    this.authenticateSpotify();
                }
            })
    }

    // Method to leave the current room the user is in (keep session in mind)
    // Call to our API endpoint to pop user from room or close if they are host
    leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/api/leave-room", requestOptions).then((_response) => {
            // Once room left, redirect to homepage
            this.props.leaveRoomCallback();
            this.props.history.push("/");
        });
    }

    updateShowSettings(value) {
        this.setState({
            showSettings: value,
        });
    }

    renderSettings() {
        return (
            <div>
                <CreateRoomPage
                    update={true}
                    votesToSkip={this.state.votesToSkip}
                    guestCanPause={this.state.guestCanPause}
                    roomCode={this.roomCode}
                    // Update room with correct state (curr vals per backend)
                    updateCallback={this.getRoomDetails}
                />

                <Grid container style={{
                    margin: 0,
                    width: '100%',
                }}
                    spacing={1} align="center">
                    <Grid item xs={12} align="center">
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => this.updateShowSettings(false)}
                        >
                            Close
                        </Button>
                    </Grid>
                </Grid>
            </div>
        );
    }


    // Only show settings button if user is host
    renderSettingsButton() {
        return (
            <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(true)}>
                    Settings
                </Button>
            </Grid>
        );
    }

    render() {
        if (this.state.showSettings) {
            return this.renderSettings();
        }

        return (
            <div>
                <ButtonAppBar />
                <Grid container style={{
                    margin: 0,
                    width: '100%',
                    }}
                    spacing={1} align="center">
                    <Grid item xs={12}>
                        <MusicPlayer {...this.state.song} />
                    </Grid>

                    <Grid item xs={12}>
                        <div>
                            <Typography variant="h5" component="h5">
                                Code: {this.roomCode}
                            </Typography>
                        </div>
                        
                        <div>
                            <Typography variant="h5" component="h5">
                                Host: {this.state.isHost.toString()}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5" component="h5">
                                Votes: {this.state.votesToSkip}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5" component="h5">
                                Guests Can Pause: {this.state.guestCanPause.toString()}
                            </Typography>
                        </div>
                    </Grid>
                    
                    {this.state.isHost ? this.renderSettingsButton() : null}
                    <Grid item xs={12}>
                        <Button color="secondary" variant="contained" onClick={this.leaveButtonPressed}>
                            Leave Room
                    </Button>
                    </Grid>
                </Grid>
                
            </div>
        )
    }
}