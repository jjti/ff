import * as React from 'react';

export default class Header extends React.Component {
  public render() {
    return (
      <div className="Header Section">
        <div id="Header-Title">
          <h1 id="App-Header">ffdraft.app</h1>
        </div>

        {/* <div className="Links">
          <button className=".Grayed">
            <Link to="/about">About</Link>
          </button>
          <a
            href="https://github.com/JJTimmons/ff"
            target="_blank"
            style={{ marginLeft: 12 }}>
            Source code
          </a>
        </div> */}
        <p>A value based fantasy football draft wizard</p>
      </div>
    );
  }
}
