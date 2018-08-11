import * as React from "react";
import "./App.css";
import Header from "./Header/Header";
import OrderTracker from "./OrderTracker/OrderTracker";
import PlayerTable from "./PlayerTable/PlayerTable";
import TeamPicks from "./TeamPicks/TeamPicks";

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Header />
        <OrderTracker />
        <PlayerTable />
        <TeamPicks />
      </div>
    );
  }
}

export default App;
