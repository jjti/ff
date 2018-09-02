import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { cssTransition, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// @ts-ignore
import ReactTooltip from 'react-tooltip';
import { compose } from 'redux';
import './App.css';
import Header from './Header/Header';
import { IPlayer } from './models/Player';
import PickHistoryContainer from './PickHistory/PickHistoryContainer';
import PlayerTableContainer from './PlayerTable/PlayerTableContainer';
import RosterFormatter from './RosterFormatter/RosterFormatter';
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

    // set the player list using setPlayers
    const xhttp = new XMLHttpRequest();
    let playerDataArray: any = {};
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        playerDataArray = JSON.parse(xhttp.responseText);
        props.setPlayers(playerDataArray);
      }
    };

    this.state = {
      mobile: window.innerWidth < 700
    };

    addEventListener('resize', () => {
      this.setState({ mobile: window.innerWidth < 700 });
    });

    xhttp.open('GET', `${process.env.PUBLIC_URL}/forecast.json`, true);
    xhttp.send();
  }

  public render() {
    // if it's on mobile, render only the team picker, and PlayerTable
    if (this.state.mobile) {
      return (
        <div id="App">
          <TeamPicks mobile={true} />
          <PlayerTableContainer mobile={true} />

          <ToastContainer
            className="toast-container toast-container-mobile"
            position="bottom-left"
            autoClose={1500}
            hideProgressBar={true}
            pauseOnHover={false}
            closeButton={false}
            draggable={false}
            transition={cssTransition({
              enter: 'zoom',
              exit: 'zoom'
            })}
          />
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

        <ToastContainer
          className="toast-container"
          position="bottom-left"
          autoClose={1750}
          hideProgressBar={true}
          pauseOnHover={false}
          closeButton={false}
          draggable={false}
          transition={cssTransition({
            enter: 'zoom',
            exit: 'zoom'
          })}
        />
        <ReactTooltip />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  setPlayers: (players: IPlayer[]) => dispatch(setPlayers(players))
});

export default compose(
  DragDropContext(HTML5Backend),
  connect(
    () => ({}),
    mapDispatchToProps
  )
)(App);
