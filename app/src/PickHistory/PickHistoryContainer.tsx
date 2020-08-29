import * as React from 'react';
import { connect } from 'react-redux';
import { IPick, ITeam } from '../models/Team';
import { setTrackedTeam, undoPick } from '../store/actions/teams';
import { IStoreState } from '../store/store';
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
  public static getDerivedStateFromProps = (
    props: IPickHistoryContainerProps
  ) => ({
    cardLength: PickHistoryContainer.getCardLength(props.numberOfTeams)
  });

  private static getCardLength = (numberOfTeams: number): number => {
    const thisWidth = window.innerWidth * 0.65; // ~30px padding, 70% width of total window size
    const cardLength = Math.floor(thisWidth / numberOfTeams); // 8 == 2px border, 6px margin
    return Math.min(cardLength, 75);
  };

  public pickRowRef: any = React.createRef();

  constructor(props: any) {
    super(props);

    this.state = {
      cardLength: PickHistoryContainer.getCardLength(props.numberOfTeams),
      open: true
    };

    window.addEventListener('resize', () =>
      this.setState({
        cardLength: PickHistoryContainer.getCardLength(this.props.numberOfTeams)
      })
    );
  }

  public componentDidUpdate = () => {
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
      (currentPick + 1) / numberOfTeams
    )} – Pick ${currentPick + 1}`;

    return (
      <PickHistory
        {...this.props}
        {...this.state}
        refProp={this.pickRowRef}
        headerMessage={headerMessage}
        toggleOpen={this.toggleOpen}
      />
    );
  }
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
  undoPick: (pick: IPick) => dispatch(undoPick(pick))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PickHistoryContainer);
