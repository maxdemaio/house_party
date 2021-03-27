import React, { Component } from 'react';
// Material UI imports
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Card from "@material-ui/core/Card";
import PlayArrow from "@material-ui/icons/PlayArrow";
import SkipNext from "@material-ui/icons/SkipNext";
import Pause from "@material-ui/icons/Pause";
import { LinearProgress } from '@material-ui/core';


export default class MusicPlayer extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        // Material UI Linear Progress of Spotify song
        // Take current timestamp, divide by total and get % out of 100
        const songProgress = (this.props.time / this.props.duration) * 100;

        return (
            <Card>
                <Grid container alignItems="center">
                    <Grid item xs={4}>
                        <img src={this.props.image_url} height="100%" width="100%"></img>
                    </Grid>
                    <Grid item xs={8}>
                        <Typography component="h5" variant="h5">
                            {this.props.title}
                        </Typography>
                        <Typography color="textSecondary" variant="subtitle1">
                            {this.props.artist}
                        </Typography>
                        <div>
                            <IconButton>
                                {this.props.is_playing ? <Pause /> : <PlayArrow />}
                            </IconButton>
                            <IconButton>
                                <SkipNext></SkipNext>
                            </IconButton>
                        </div>
                    </Grid>
                </Grid>
                <LinearProgress variant="determinate" value={songProgress} />
            </Card>
        );
    }
}