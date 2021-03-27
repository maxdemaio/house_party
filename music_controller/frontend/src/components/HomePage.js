import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import ButtonAppBar from "./ButtonAppBar";


export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };

    this.clearRoomCode = this.clearRoomCode.bind(this);
  }

  async componentDidMount() {
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code,
        });
      });
  }

  renderHomePage() {
    return (
      <div>
      <ButtonAppBar />
        <Grid container style={{
          margin: 0,
          width: '100%',
        }}
          spacing={1} align="center">
        <Grid item xs={12}>
          <Typography variant="h3" compact="h3">
            Welcome to House Party
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a Room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      </div>
    );
  }

  clearRoomCode() {
    this.setState({
      roomCode: null,
    })
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              {/*Redirect user to room if they had a room previously*/}
              return this.state.roomCode ? (
                <Redirect to={`/room/${this.state.roomCode}`} />
              ) : (
                this.renderHomePage()
              );
            }}
          />
          <Route path="/join" component={RoomJoinPage} />
          <Route path="/create" component={CreateRoomPage} />
          <Route path="/room/:roomCode" render={(props) => {
            // Take all props and pass them into our Room component
            // Passing method to room component
            // When the room component calls this method, it can modify the parent
            // Parent in this case in the HomePage (change roomcode in parent)
            return <Room {...props} leaveRoomCallback={this.clearRoomCode} />
          }} />
        </Switch>
      </Router>
    );
  }
}