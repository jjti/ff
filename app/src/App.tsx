import * as React from 'react';
import { connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
// @ts-ignore
import { compose } from 'redux';
import './App.css';
import RosterFormatter from './Formatters/RosterFormatter';
import ScoringFormatter from './Formatters/ScoringFormatter';
import Header from './Header/Header';
import Helmet from './Helmet';
import MobileSettings from './MobileSettings/MobileSettings';
import { IPlayer } from './models/Player';
import PickHistoryContainer from './PickHistory/PickHistoryContainer';
import PlayerTableContainer from './PlayerTable/PlayerTableContainer';
import Settings from './Settings/Settings';
import { setPlayers } from './store/actions/players';
import TeamPicks from './TeamPicks/TeamPicks';

interface IProps {
  setPlayers: (players: IPlayer[]) => void;
}

interface IState {
  mobile: boolean;
}

class App extends React.PureComponent<IProps, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      mobile: window.innerWidth < 700
    };

    addEventListener('resize', () => {
      this.setState({ mobile: window.innerWidth < 700 });
    });
  }

  public render() {
    // if it's on mobile, render only the team picker, and PlayerTable
    if (this.state.mobile) {
      return (
        <div id="App">
          <MobileSettings />
          <TeamPicks mobile={true} />
          <PlayerTableContainer mobile={true} />

          <RosterFormatter />
          <ScoringFormatter />
        </div>
      );
    }

    return (
      <div id="App">
        {Helmet}
        <div className="App-Left-Column">
          <Header />
          <Settings />
          <TeamPicks />
        </div>
        <div className="App-Right-Column">
          <PickHistoryContainer />
          <PlayerTableContainer />
        </div>
        <RosterFormatter />
        <ScoringFormatter />
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
