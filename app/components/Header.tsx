import * as React from 'react';

export default class Header extends React.Component {
  public render() {
    return (
      <div className="Header Section">
        <div id="Header-Title">
          <h1 id="App-Header">ffdraft.app</h1>
        </div>
        <a href="https://github.com/jjtimmons/ff" target="_blank">
          A value-based fantasy football draft wizard
        </a>
      </div>
    );
  }
}
