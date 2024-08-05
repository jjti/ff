import * as React from 'react';
import 'react-toastify/dist/ReactToastify.css';

import Header from './Header';
import MobileSettings from './MobileSettings';
import PickHistoryContainer from './PickHistoryContainer';
import PlayerTableContainer from './PlayerTableContainer';
import RosterModal from './RosterModal';
import ScoringModal from './ScoringModal';
import Settings from './Settings';
import TeamNameModal from './TeamNameModal';
import TeamPicks from './TeamPicks';

interface IState {
  mobile: boolean;
}

export default class App extends React.Component<{}, IState> {
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

          <RosterModal />
          <ScoringModal />
          <TeamNameModal />
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
        <RosterModal />
        <ScoringModal />
        <TeamNameModal />
      </div>
    );
  }
}
