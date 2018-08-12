import * as React from "react";
import { connect } from "react-redux";

import "./App.css";
import "./Card.css";
import Header from "./Header/Header";
import OrderTracker from "./OrderTracker/OrderTracker";
import { IPlayer } from "./Player";
import PlayerTable from "./PlayerTable/PlayerTable";
import { setPlayers } from "./store/actions/players";
import TeamPicks from "./TeamPicks/TeamPicks";

interface IProps {
  setPlayers: (players: IPlayer[]) => void;
}

class App extends React.Component<IProps> {
  constructor(props: any) {
    super(props);

    // set the player list using setPlayers
    const xhttp = new XMLHttpRequest();
    let playerDataArray: any = {};
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        playerDataArray = JSON.parse(xhttp.responseText);
        props.setPlayers(playerDataArray);
      }
    };

    xhttp.open("GET", `${process.env.PUBLIC_URL}/forecast.json`, true);
    xhttp.send();
  }

  public render() {
    return (
      <div id="App">
        <div className="App-Row-Top">
          <div className="App-Left-Column App-Block">
            <Header />
          </div>
          <div className="App-Right-Column App-Block">
            <OrderTracker />
          </div>
        </div>
        <div className="App-Row-Bottom">
          <div className="App-Left-Column App-Block">
            <TeamPicks />
          </div>
          <div className="App-Right-Column App-Block">
            <PlayerTable />
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  setPlayers: (players: IPlayer[]) => dispatch(setPlayers(players))
});

export default connect(
  () => ({}),
  mapDispatchToProps
)(App);
