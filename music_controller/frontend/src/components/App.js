import React, { Component } from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";


export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <HomePage />
      </div>
    );
  }
}

/* get app div inside our HTML */
/* Render our components inside the app div */
const appDiv = document.getElementById("app");
render(<App />, appDiv);
