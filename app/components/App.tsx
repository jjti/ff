import * as React from 'react';
import { connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import RosterFormatter from './RosterFormatter';
import ScoringFormatter from './ScoringFormatter';
import MobileSettings from './MobileSettings';
import { IPlayer } from '../lib/models/Player';
import PickHistoryContainer from './PickHistoryContainer';
import PlayerTableContainer from './PlayerTableContainer';
import Settings from './Settings';
import { setPlayers } from '../lib/store/actions/players';
import TeamPicks from './TeamPicks';
import Header from './Header';

interface IProps {
  setPlayers: (players: IPlayer[]) => void;
}

interface IState {
  mobile: boolean;
}

class App extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      mobile: false,
    };
  }

  componentDidMount = () => {
    window.addEventListener('resize', this.mobile);
    this.mobile();
  };

  mobile = () => {
    this.setState({ mobile: window.innerWidth < 700 });
  };

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
  setPlayers: (players: IPlayer[]) => dispatch(setPlayers(players)),
});

export default connect(() => ({}), mapDispatchToProps)(App);
