import React, { Component } from 'react';
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

export default class CreateRoomPage extends Component{
    defaultVotes = 2;

    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Typography component="h4" variant="h4">
                            Create A Room
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormHelperText>
                                <div>
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
                </Grid>
            </div>
        );
    }
}