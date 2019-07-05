import * as React from 'react';
import { connect } from 'react-redux';
import { IPlayer, Position } from '../models/Player';
import { NullablePlayer } from '../models/Team';
import { removePlayer, selectPlayer } from '../store/actions/players';
import { pickPlayer, skipPick, undoLast } from '../store/actions/teams';
import { IStoreState } from '../store/store';
import PlayerTable from './PlayerTable';

interface IPlayerTableProps {
  /**
   * Key is bye week number, value is whether there's a conflict with starter
   */
  byeWeeks: { [key: number]: boolean };
  currentPick: number;
  mobile?: boolean;
  undraftedPlayers: any[];
  pickPlayer: (player: IPlayer) => void;

  /**
   * Key is the team name, defined for a team if there's a player on
   * the drafters roster that's an RB from that team
   */
  rbHandcuffTeams: { [key: string]: boolean };
  removePlayer: (player: IPlayer) => void;
  selectPlayer: (player: IPlayer) => void;

  skip: () => void;
  undo: () => void;

  /**
   * Array of positions (key) and whether the drafter has NOT filled those positions.
   * True if it's still not filled (ie valuable)
   */
  valuedPositions: { [key: string]: boolean };
}

interface IPlayerTableState {
  /**
   * The name of the player the user is searching for.
   * Only show players with a similar name
   */
  nameFilter: string;

  /**
   * Only show players in these positions, hide the rest
   */
  positionsToShow: Position[];
}

/**
 * A table displaying all the undrafted players
 *
 * Includes buttons for skipping the current round, without a pick,
 * and undoing the last round/pick (in the event of a mistake)
 */
class PlayerTableContainer extends React.Component<
  IPlayerTableProps,
  IPlayerTableState
> {
  public static defaultProps = {
    mobile: false
  };

  public state: IPlayerTableState = {
    nameFilter: '',
    positionsToShow: ['?'] // ? is a hackish flag for "ALL"
  };

  /** clear name filter after a player was picked */
  public componentWillReceiveProps = () => {
    this.setState({ nameFilter: '' });
  };

  public render() {
    const {
      currentPick,
      mobile,
      rbHandcuffTeams,
      undraftedPlayers: players,
      valuedPositions
    } = this.props;
    const { nameFilter, positionsToShow } = this.state;

    // players after filtering by position
    // array of booleans for whether not to show the player
    let filteredPlayers =
      positionsToShow.length === 1 && positionsToShow[0] === '?'
        ? new Array(players.length).fill(false)
        : players.map(p => positionsToShow.indexOf(p.pos) < 0);

    // filter by the nameFilter (for name and team)
    const nameFilterLower = nameFilter.toLowerCase();
    if (nameFilterLower) {
      filteredPlayers = filteredPlayers.map((filtered, i) => {
        if (filtered) {
          // it's already being filtered out
          return true;
        }

        // check for whether the name, split is similar to nameFilter
        const { name } = players[i];
        const lowercaseName = name.toLowerCase();
        const names = lowercaseName.split(' ');
        const firstNameMatch = names[0].startsWith(nameFilterLower);
        const lastNameMatch = names[1]
          ? names[1].startsWith(nameFilterLower)
          : false;

        // filter out all players but those that match the search term
        return !(
          lowercaseName.startsWith(nameFilterLower) ||
          firstNameMatch ||
          lastNameMatch
        );
      });
    }

    // players that will be drafted soon
    const draftSoon = players.map(p => p.adp > 0 && currentPick + 10 >= p.adp);

    // players that are RB handcuffs
    const rbHandcuffs = players.filter(
      (p, i) => !filteredPlayers[i] && p.pos === 'RB' && rbHandcuffTeams[p.team]
    );

    // players that will are recommended
    let recommendedCount = 0;
    const recommended = players.reduce((acc, p, i) => {
      // for first few, it's likely a yes
      if (recommendedCount < 3 && valuedPositions[p.pos]) {
        if (draftSoon[i] || p.adp === 0) {
          // accounting for players w/ a lack of adps
          recommendedCount += 1;
          return [...acc, p];
        }
      } else if (i < 30 && rbHandcuffs.indexOf(p) > -1) {
        recommendedCount += 1;
        return [...acc, p];
      }
      return acc;
    }, []);

    return (
      <PlayerTable
        {...this.props}
        players={players}
        draftSoon={draftSoon}
        filteredPlayers={filteredPlayers}
        nameFilter={nameFilter}
        mobile={!!mobile}
        recommended={recommended}
        positionsToShow={positionsToShow}
        rbHandcuffs={rbHandcuffs}
        setNameFilter={this.setNameFilter}
        setPositionFilter={this.setPositionFilter}
      />
    );
  }

  /**
   * update the allowable positions in state, used to filter out players by position
   */
  private setPositionFilter = (position: Position) => {
    let { positionsToShow } = this.state;

    // if it's ?, clear anything else
    if (position === '?') {
      this.setState({ positionsToShow: ['?'] });
    } else if (positionsToShow.indexOf(position) > -1) {
      positionsToShow = positionsToShow.filter(p => p !== position);
      this.setState({
        positionsToShow: positionsToShow.length ? positionsToShow : ['?']
      });
    } else {
      positionsToShow = positionsToShow.filter(p => p !== '?');
      this.setState({
        positionsToShow: positionsToShow.concat([position])
      });
    }
  };

  /**
   * update the filter for searching for a plauer by name or team
   */
  private setNameFilter = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({ nameFilter: event.currentTarget.value });
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { QB, RB, WR, TE, FLEX, DST, K, BENCH } = state.teams[
    state.trackedTeam
  ];

  // add the positions to the object that the trackedTeam hasn't
  // filled their roster with (ie they have space for)
  const notFilled = (pos: NullablePlayer[]) => !pos.every((p: IPlayer) => !!p);
  const valuedPositions = {} as any;
  if (notFilled(QB)) {
    valuedPositions.QB = true;
  }
  if (notFilled(RB)) {
    valuedPositions.RB = true;
  }
  if (notFilled(WR)) {
    valuedPositions.WR = true;
  }
  if (notFilled(FLEX)) {
    valuedPositions.RB = true;
    valuedPositions.WR = true;
  }
  if (notFilled(TE)) {
    valuedPositions.TE = true;
  }

  // after one of each main starter has been drafted, everything is valued
  if (!Object.keys(valuedPositions).length) {
    // always want more RBs and WRs
    valuedPositions.RB = true;
    valuedPositions.WR = true;

    // only want one backup QB and TE
    const QBBackupCount = BENCH.filter(p => p && p.pos === 'QB').length;
    if (QBBackupCount < 1) {
      valuedPositions.QB = true;
    }
    const TEBackupCount = BENCH.filter(p => p && p.pos === 'TE').length;
    if (TEBackupCount < 1) {
      valuedPositions.TE = true;
    }
  }

  // only want one of each K and DST, none on bench
  if (notFilled(K)) {
    valuedPositions.K = true;
  }
  if (notFilled(DST)) {
    valuedPositions.DST = true;
  }

  // find the bye weeks already taken by the core players (QB, RB, WR, FLEX)
  const byeWeeks = [...QB, ...RB, ...WR, ...FLEX]
    .map(p => p && p.bye)
    .reduce((acc, bye) => (bye ? { ...acc, [bye]: true } : acc), {});

  // find the teams of the rbs, other rbs on these teams will be handcuffs
  const rbHandcuffTeams = [...RB, ...FLEX]
    .filter((p: IPlayer) => p && p.pos === 'RB')
    .reduce((acc, p: IPlayer) => ({ ...acc, [p.team]: true }), {});

  return {
    byeWeeks,
    currentPick: state.currentPick,
    rbHandcuffTeams,
    undraftedPlayers: state.undraftedPlayers,
    valuedPositions
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  pickPlayer: (player: IPlayer) => dispatch(pickPlayer(player)),
  removePlayer: (player: IPlayer) => dispatch(removePlayer(player)),
  selectPlayer: (player: IPlayer) => dispatch(selectPlayer(player)),
  skip: () => dispatch(skipPick()),
  undo: () => dispatch(undoLast())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerTableContainer);
