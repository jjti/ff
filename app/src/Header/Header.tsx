import * as React from "react";

import "./Header.css";

export default class Header extends React.Component {
  public render() {
    return (
      <div className="Header">
        <h1 id="App-Header">FF DRAFT</h1>
        <p>A fantasy football draft tool</p>
        <p>
          Pick players based on their value over replacement, expert
          predictions, and Madden
        </p>
      </div>
    );
  }
}
