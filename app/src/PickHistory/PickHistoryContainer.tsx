import * as React from 'react';
import { connect } from 'react-redux';

import { setTrackedTeam, undoPlayerPick } from '../store/actions/teams';
import { IStoreState } from '../store/store';
import { IPick, ITeam } from '../Team';
import PickHistory from './PickHistory';

interface IPickHistoryContainerProps {
  activeTeam: number;
  currentPick: number;
  numberOfTeams: number;
  pastPicks: IPick[];
  setTrackedTeam: (team: number) => void;
  teams: ITeam[];
  trackedTeam: number;
  undoPick: (pick: IPick) => void;
}

interface IPickHistoryContainerState {
  cardLength: number;
  open: boolean;
}

class PickHistoryContainer extends React.Component<
  IPickHistoryContainerProps,
  IPickHistoryContainerState
> {
  public pickRowRef: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props: any) {
    super(props);

    this.state = {
      cardLength: this.getCardLength(props.numberOfTeams),
      open: true
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

    // scroll the pick row back to the left
    if (this.pickRowRef.current) {
      this.pickRowRef.current.scrollLeft = 0;
    }
  };

  public toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };

  public render() {
    const { currentPick, numberOfTeams } = this.props;

    // round tracker message
    const headerMessage = `Round ${Math.ceil(
      currentPick / numberOfTeams
    )} – Pick ${currentPick}`;

    return (
      <PickHistory
        {...this.props}
        {...this.state}
        ref={this.pickRowRef}
        headerMessage={headerMessage}
        toggleOpen={this.toggleOpen}
      />
    );
  }

  private getCardLength = (numberOfTeams: number): number => {
    const thisWidth = window.innerWidth * 0.65; // ~30px padding, 70% width of total window size
    const cardLength = Math.floor(thisWidth / numberOfTeams); // 8 == 2px border, 6px margin
    return Math.min(cardLength, 75);
  };
}

const mapStateToProps = ({
  activeTeam,
  currentPick,
  numberOfTeams,
  pastPicks,
  teams,
  trackedTeam
}: IStoreState) => ({
  activeTeam,
  currentPick,
  numberOfTeams,
  pastPicks,
  teams,
  trackedTeam
});

const mapDispatchToProps = (dispatch: any) => ({
  setTrackedTeam: (teamToTrack: number) =>
    dispatch(setTrackedTeam(teamToTrack)),
  undoPick: (pick: IPick) => dispatch(undoPlayerPick(pick))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PickHistoryContainer);
