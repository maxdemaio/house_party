import React, { Component } from 'react';
import { render } from 'react-dom';
import HomePage from './HomePage';


export default class App extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>
                <h1>Testing React Code</h1>
                <HomePage />
            </div>
        );
    }
}

/* get app div inside our HTML */
const appDiv = document.getElementById("app");

/* Render our components inside the app div */
render(
    <App />, appDiv
);