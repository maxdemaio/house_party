import React, { Component } from 'react';
import CreateRoomForm from './CreateRoomForm';

export default class CreateRoomPage extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <CreateRoomForm></CreateRoomForm>
        );
    }
}