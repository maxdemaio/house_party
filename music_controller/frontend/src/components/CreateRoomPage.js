import React, { Component } from 'react';
import CreateRoomForm from './CreateRoomForm';

export default class CreateRoomPage extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        return(
            // Since history doesn't get passed into Children components from
            // React router, we can pass it as props so we can redirect
            <CreateRoomForm history={this.props.history}></CreateRoomForm>
        );
    }
}