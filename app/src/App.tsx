import * as React from "react";
import "./App.css";
import "./Card.css";
import Header from "./Header/Header";
import OrderTracker from "./OrderTracker/OrderTracker";
import { IPlayer } from "./Player";
import PlayerTable from "./PlayerTable/PlayerTable";
import TeamPicks from "./TeamPicks/TeamPicks";

interface IProps {
  playerData: IPlayer[];
}

class App extends React.Component<IProps> {
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
            <PlayerTable playerData={this.props.playerData} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
