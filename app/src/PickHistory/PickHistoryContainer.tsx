import * as React from 'react';
import { connect } from 'react-redux';

import { setTrackedTeam } from '../store/actions/teams';
import { IStoreState } from '../store/store';
import { ITeam } from '../Team';
import PickHistory from './PickHistory';

interface IPickHistoryContainerProps {
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

class OrderTracker extends React.Component<IPickHistoryContainerProps, State> {
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

  public componentWillReceiveProps = (props: IPickHistoryContainerProps) => {
    this.setState({
      cardLength: this.getCardLength(props.numberOfTeams)
    });
  };

  public toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };

  public render() {
    const { activeTeam, currentPick, numberOfTeams } = this.props;
    const { cardLength, open } = this.state;

    // round tracker message
    const headerMessage = `Round ${Math.ceil(
      currentPick / numberOfTeams
    )} – Pick ${currentPick}`;

    // amount to shift the "current draft" arrow from the left
    const cursorLeft = activeTeam * (cardLength + 14) + 0.2 * cardLength;

    return (
      <PickHistory
        {...this.props}
        cardLength={cardLength}
        cursorLeft={cursorLeft}
        open={open}
        headerMessage={headerMessage}
        toggleOpen={this.toggleOpen}
      />
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
