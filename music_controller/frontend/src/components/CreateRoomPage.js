import React from 'react';
import Link from 'react-router-dom/Link';
// Material UI imports
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ButtonAppBar from './ButtonAppBar';
import Collapse from "@material-ui/core/Collapse";

/* 
Note: history doesn't get passed into Children components from 
React router, we can pass it as props so we can redirect.

Ex) <CreateRoomForm history={this.props.history}></CreateRoomForm>/}
*/

export default class CreateRoomPage extends React.Component {
    // Default props with static variable
    static defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => { },
    }

    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            errorMsg: "",
            successMsg: "",
        };

        this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this);
        this.handleVotesChange = this.handleVotesChange.bind(this);
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
    }


    handleVotesChange(e) {
        // Object that called func (e)
        // Update votes to skip on change of textfield
        this.setState({
            votesToSkip: e.target.value,
        })
    }


    handleGuestCanPauseChange(e) {
        this.setState({
            // If value is 'true' or 'false' update state's boolean val
            guestCanPause: e.target.value === 'true' ? true : false,
        })
    }


    handleRoomButtonPressed() {
        // Send request to our backend API
        // Allows us to create a room
        // With values from state
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // should match what we have in our serializer on backend
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
            })
        };

        fetch('/api/create-room', requestOptions)
            .then((response) => response.json())
            // Redirect user to the room's page
            .then((data) => {
                console.log(data.code);
                console.log(this.props.history);
                this.props.history.push("/room/" + data.code)
            });
    }

    
    handleUpdateButtonPressed() {
        // Send request to our backend API
        // Allows us to update a room
        const requestOptions = {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
                code: this.props.roomCode,
            }),
        };
        fetch("/api/update-room", requestOptions).then((response) => {
            if (response.ok) {
                this.setState({
                    successMsg: "Room updated successfully!",
                });
            } else {
                this.setState({
                    errorMsg: "Error updating room...",
                });
            }
            this.props.updateCallback();
        });
    }

    
    renderCreateButtons() {
        return (
            <>
                <Grid item xs={12}>
                    <Button
                        color="primary" variant="contained"
                        onClick={this.handleRoomButtonPressed}>
                        Create a Room
                        </Button>
                </Grid>
                <Grid item xs={12}>
                    <Button color="secondary" variant="contained" to="/" component={Link}>
                        Back Home
                        </Button>
                </Grid>
            </>
        );
    }


    renderUpdateButtons() {
        return (
            <>
                <Grid item xs={12}>
                    <Button
                        color="primary" variant="contained"
                        onClick={this.handleUpdateButtonPressed}>
                        Update Room
                        </Button>
                </Grid>
            </>
        );
    }


    render() {
        // Check if we are using as a settings page
        const title = this.props.update ? "Update Room" : "Create a Room"

        return (
            <div>
                <ButtonAppBar />
                <Grid container spacing={1} align="center">
                    <Grid item xs={12}>
                        {/* Check for update messages in state */}
                        <Collapse in={this.state.errorMsg != "" || this.state.successMsg != ""}>
                            {this.state.successMsg}
                        </Collapse>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography component="h4" variant="h4">
                            {title}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormHelperText>
                                <div align="center">
                                    Guest Control of Playback State
                                </div>
                            </FormHelperText>
                            <RadioGroup row defaultValue="true" onChange={this.handleGuestCanPauseChange}>
                                <FormControlLabel
                                    value="true"
                                    control={<Radio color="primary" />}
                                    label="Play/Pause"
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel
                                    value="false"
                                    control={<Radio color="secondary" />}
                                    label="No Control"
                                    labelPlacement="bottom"
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl>
                            <TextField required={true}
                                type="number"
                                defaultValue={this.state.votesToSkip}
                                inputProps={{
                                    min: 1,
                                    style: { textAlign: "center" }
                                }}
                                onChange={this.handleVotesChange}
                            />
                            <FormHelperText>
                                <div align="center">Votes Required to Skip Song</div>
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    {this.props.update ? this.renderUpdateButtons() : this.renderCreateButtons()}
                </Grid>
            </div>
        );
    }
}