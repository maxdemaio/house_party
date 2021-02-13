import React from 'react';
import { Link } from 'react-router-dom';
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


export default class CreateRoomForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            guestCanPause: true,
            votesToSkip: this.defaultVotes,
        };

        this.handleVotesChange = this.handleVotesChange.bind(this);
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
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

    render(){
        return (
            <div>
                <Grid container spacing={1} align="center">
                    <Grid item xs={12}>
                        <Typography component="h4" variant="h4">
                            Create A Room
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormHelperText>
                                <div align="center">
                                    Guest Control of Playback State
                                </div>
                            </FormHelperText>
                            <RadioGroup row defaultValue="true">
                                <FormControlLabel 
                                    value="true" 
                                    control={<Radio color="primary"/>}
                                    label="Play/Pause"
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel 
                                    value="false" 
                                    control={<Radio color="secondary"/>}
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
                                defaultValue={this.defaultVotes}
                                inputProps={{
                                    min: 1,
                                    style: {textAlign: "center"}
                                }}
                            />
                            <FormHelperText>
                                <div align="center">Votes Required to Skip Song</div>
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button color="primary" variant="contained">Create a Room</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button color="secondary" variant="contained" to="/" component={Link}>
                            Back
                        </Button>
                    </Grid>
                </Grid>
            </div>
        );
    }
}