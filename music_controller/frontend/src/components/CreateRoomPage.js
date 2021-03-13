import React, { Component } from 'react';
import CreateRoomForm from './CreateRoomForm';
import ButtonAppBar from "./ButtonAppBar";

export default class CreateRoomPage extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <div>
                <ButtonAppBar />
                {/* Since history doesn't get passed into Children components from 
                    React router, we can pass it as props so we can redirect */}
                <CreateRoomForm history={this.props.history}></CreateRoomForm>
            </div>
        );
    }
}