import React, { Component } from 'react';
import Link from 'react-router-dom/Link';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ButtonAppBar from "./ButtonAppBar";

export default class RoomJoinPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            roomCode: "",
            error: ""
        }
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
    }

    handleTextFieldChange(e) {
        this.setState({
            roomCode: e.target.value
        })
    }

    handleRoomButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                code: this.state.roomCode
            })
        };

        fetch('/api/join-room', requestOptions)
            .then((reponse) => {
                // Successfully joined room, redir to room
                if (reponse.ok) {
                    this.props.history.push(`/room/${this.state.roomCode}`);
                } else {
                    this.setState({
                        error: "Room not found."
                    })
                }
            }).catch((error) => {
                console.log(error);
            })
    }

    render(){
        return (
            <div>
            <ButtonAppBar />
            <Grid container spacing={1} align="center">
                <Grid item xs={12}>
                    <Typography variant="h4" component="h4">
                        Join a Room
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField 
                        error={this.state.error}
                        label="Code"
                        placeholder="Enter a Room Code"
                        value={this.state.roomCode}
                        helperText={this.state.error}
                        variant="outlined"
                        onChange={this.handleTextFieldChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={this.handleRoomButtonPressed}>
                        Enter Room
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Button color="secondary" variant="contained" to="/" component={Link}>
                        Back Home
                    </Button>
                </Grid>
            </Grid>
            </div>
        );
    }
}