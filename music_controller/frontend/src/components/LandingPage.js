import React, { Component } from 'react'
import ButtonAppBar from "./ButtonAppBar";
import Link from 'react-router-dom/Link';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ButtonGroup from "@material-ui/core/ButtonGroup";

export default class LandingPage extends Component {
    render() {
        return (
            <div>
                <ButtonAppBar />
                <Grid container spacing={3} align="center">
                    <Grid item xs={12}>
                        <Typography variant="h3" compact="h3">
                            Welcome to House Party
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <ButtonGroup disableElevation variant="contained" color="primary">
                            <Button color="primary" to="/join" component={Link}>
                                Join a room
                            </Button>
                            <Button color="secondary" to="/create" component={Link}>
                                Create a room
                            </Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            </div>
        )
    }
}
