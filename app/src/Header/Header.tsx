import * as React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default class Header extends React.Component {
  public render() {
    return (
      <div className="Header Section">
        <h1 id="App-Header">ffdraft.app</h1>
        <p>A value based fantasy football draft wizard</p>
        <button className=".Grayed" style={{ marginLeft: 0 }}>
          <Link to="/about">About</Link>
        </button>
      </div>
    );
  }
}
