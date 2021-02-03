import React, { Component } from 'react';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import { BrowserRouter as Router, Switch, Route, Link, Redirect} from 'react-router-dom';


export default class HomePage extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return (
            // Home page navigation w router
            <Router>
                <p>This is the home page!</p>
            </Router>
        );
    }
}