import * as React from "react";

export default class Header extends React.Component {
  public render() {
    return (
      <div className="Header">
        <h1 className="App-header">FF DRAFT</h1>
        <p>A Fantasy Football draft helper.</p>
        <p>
          Pick players based on Value Over Replacement, Expert Predictions, and
          Madden
        </p>
      </div>
    );
  }
}
