// Main landing page for a new room
import React, { Component } from 'react';

export default class Room extends Component{
    constructor(props){
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
        };
        // Match prop stores how we got to this component from Router
        this.roomCode = this.props.match.params.roomCode;
        // Bind this to our functions so we can access it
        this.getRoomDetails = this.getRoomDetails.bind(this);

        // Call once everything is constructed
        // Starts with defaults and then gets populated
        this.getRoomDetails();
    }

    getRoomDetails() {
        fetch('/api/get-room' + '?code=' + this.roomCode)
            .then((response) => response.json())
            .then((data) => {
                this.setState({
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host,
                })
            })
    }

    render() {
        return (
            <div>
                <h3>{this.roomCode}</h3>
                <p>votes: {this.state.votesToSkip}</p>
                <p>Guest can pause: {this.state.guestCanPause.toString()}</p>
                <p>Host: {this.state.isHost.toString()}</p>
            </div>
        );
    }
}