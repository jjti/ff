import * as React from 'react';
import { connect } from 'react-redux';

import { setTrackedTeam } from '../store/actions/teams';
import { IStoreState } from '../store/store';
import { ITeam } from '../Team';

import './OrderTracker.css';

interface IProps {
  activeTeam: number;
  currentPick: number;
  numberOfTeams: number;
  setTrackedTeam: (team: number) => void;
  teams: ITeam[];
  trackedTeam: number;
}

const initialState = {
  cardLength: 50,
  open: true
};
type State = Readonly<typeof initialState>;

class OrderTracker extends React.Component<IProps, State> {
  public readonly state: State = initialState;

  constructor(props: any) {
    super(props);

    this.state = {
      ...initialState,
      cardLength: this.getCardLength(props.numberOfTeams)
    };
    window.addEventListener('resize', () =>
      this.setState({
        cardLength: this.getCardLength(this.props.numberOfTeams)
      })
    );
  }

  public componentWillReceiveProps = (props: IProps) => {
    this.setState({
      cardLength: this.getCardLength(props.numberOfTeams)
    });
  };

  public toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };

  public render() {
    const {
      activeTeam,
      currentPick,
      numberOfTeams,
      teams,
      trackedTeam
    } = this.props;
    const { cardLength, open } = this.state;

    // round tracker message
    const roundTracker = `Round ${Math.ceil(
      currentPick / numberOfTeams
    )} – Pick ${currentPick}`;

    // amount to shift the "current draft" arrow from the left
    const activeTeamLeft = activeTeam * (cardLength + 14) + 0.2 * cardLength;

    return (
      <div className="OrderTracker Section">
        <header className="OrderTracker-Header" onClick={this.toggleOpen}>
          <h3>Teams</h3>
          <p>{roundTracker}</p>
          {open ? <i className="up Grayed" /> : <i className="down Grayed" />}
        </header>

        {open && (
          <>
            <div className="Team-Cards">
              {teams.map((t, i) => (
                <div
                  className={`Card ${
                    i === trackedTeam ? 'Card-Active' : 'Card-Empty'
                  }`}
                  key={i}
                  style={{ width: cardLength, height: cardLength }}
                  onClick={() => this.props.setTrackedTeam(i)}>
                  <h4>{i + 1}</h4>
                  <p className="points">{t.StarterValue}</p>
                </div>
              ))}
            </div>
            <div className="Team-Arrow-Up" style={{ left: activeTeamLeft }} />
            <p
              className="Team-Arrow-Label small"
              style={{ left: activeTeamLeft + 21 }}>
              Drafting
            </p>
          </>
        )}
      </div>
    );
  }

  private getCardLength = (numberOfTeams: number): number => {
    const thisWidth = window.innerWidth * 0.65; // ~30px padding, 70% width of total window size
    const cardLength = Math.floor(thisWidth / numberOfTeams) - 7; // 8 == 2px border, 6px margin
    return Math.min(cardLength, 70);
  };
}

const mapStateToProps = ({
  activeTeam,
  currentPick,
  numberOfTeams,
  teams,
  trackedTeam
}: IStoreState) => ({
  activeTeam,
  currentPick,
  numberOfTeams,
  teams,
  trackedTeam
});

const mapDispatchToProps = (dispatch: any) => ({
  setTrackedTeam: (teamToTrack: number) => dispatch(setTrackedTeam(teamToTrack))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrderTracker);
