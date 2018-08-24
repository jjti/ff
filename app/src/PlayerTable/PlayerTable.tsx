import * as React from "react";
import { connect } from "react-redux";

import { IPlayer, Position } from "../Player";
import {
  removePlayer,
  selectPlayer,
  undoPlayerPick
} from "../store/actions/players";
import { incrementDraft, pickPlayer } from "../store/actions/teams";
import { getPlayers } from "../store/reducers/players";
import { IStoreState } from "../store/store";

import "./PlayerTable.css";

interface IProps {
  byeWeeks: { [key: number]: boolean };
  currentPick: number;
  mobile?: boolean;
  undraftedPlayers: any[];
  pickPlayer: (player: IPlayer) => void;
  removePlayer: (player: IPlayer) => void;
  selectPlayer: (player: IPlayer) => void;
  skip: () => void;
  undo: () => void;
  valuedPositions: { [key: string]: boolean };
}

interface IState {
  positionsToShow: Position[];
}

/**
 * A table displaying all the undrafted players
 *
 * Includes buttons for skipping the current round, without a pick,
 * and undoing the last round/pick (in the event of a mistake)
 */
class PlayerTable extends React.Component<IProps, IState> {
  public static defaultProps = {
    mobile: false
  };

  public state: IState = {
    positionsToShow: ["?"] // ? is a hackish flag for "ALL"
  };

  /** All possible positions. ? Means any position, don't filter */
  private possiblePositions: Position[] = [
    "?",
    "QB",
    "RB",
    "WR",
    "TE",
    "DST",
    "K"
  ];

  public render() {
    const { currentPick, undraftedPlayers } = this.props;
    const { positionsToShow } = this.state;

    const draftSoon = undraftedPlayers.map(
      p => p.adp && currentPick + 10 > p.adp
    );

    console.log(positionsToShow);

    const playersToRender =
      positionsToShow.length === 1 && positionsToShow[0] === "?"
        ? undraftedPlayers
        : undraftedPlayers.filter(p => positionsToShow.indexOf(p.pos) > -1);

    return (
      <div id="PlayerTable">
        {!this.props.mobile && (
          <>
            <header className="PlayerTable-Header">
              <h3>PLAYERS</h3>

              {/* Buttons for filtering on position */}
              <div className="PlayerTable-Position-Buttons">
                {this.possiblePositions.map(p => (
                  <button
                    key={p}
                    className={positionsToShow.indexOf(p) > -1 ? "Active" : ""}
                    onClick={() => this.setPositionFilter(p)}
                  >
                    {p === "?" ? "All" : p}
                  </button>
                ))}
              </div>

              {/* Buttons for skipping and undoing actions */}
              <button className="Grayed skip-button" onClick={this.props.skip}>
                Skip
              </button>
              <button className="Grayed undo-button" onClick={this.props.undo}>
                Undo
              </button>
            </header>
          </>
        )}

        {/* Legend for dots on the row */}
        <div className="Legend-Row">
          <div className="green-dot" />
          <p className="small">Will be drafted soon</p>
          <div className="orange-dot" />
          <p className="small">BYE week conflict with starter</p>
        </div>

        <table>
          <thead className="table-head">
            <tr>
              <th className="th-left">Name</th>
              <th className="th-left">Position</th>
              <th className="th-left">Team</th>
              <th className="th-right" data-tip="Value over replacement">
                VOR
              </th>
              {/* Table headers not rendered on mobile */}
              {!this.props.mobile && (
                <>
                  <th
                    className="th-right"
                    data-tip="Average draft position (ESPN)"
                  >
                    ADP
                  </th>
                  <th
                    className="th-right"
                    data-tip="Predicted number of regular season points"
                  >
                    Prediction
                  </th>
                  <th
                    className="th-right"
                    data-tip="Average of expert predictions (ESPN, FOX, CBS, NFL)"
                  >
                    Experts
                  </th>
                  <th
                    className="th-right"
                    data-tip="Madden 2019 Overall player stat"
                  >
                    Madden
                  </th>
                  <th className="th-right">Remove</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {playersToRender.map((p: IPlayer, i) => (
              <tr
                key={p.name + p.pos + p.team}
                onClick={() => this.props.pickPlayer(p)}
                className={
                  this.props.valuedPositions[p.pos]
                    ? "PlayerTable-Row"
                    : "PlayerTable-Row PlayerTable-Row-Inactive"
                }
              >
                <td className="PlayerTable-Row-Name">
                  <p>{p.name} </p>
                  {/* Add dots for information on bye week */}
                  {draftSoon[i] ? <div className="dot green-dot" /> : null}{" "}
                  {this.props.byeWeeks[p.bye] ? (
                    <div className="dot orange-dot" />
                  ) : null}
                </td>
                <td>{p.pos}</td>
                <td>{p.team}</td>
                <td className="th-right">{p.vor}</td>
                {/* Table data not rendered on mobile */}
                {!this.props.mobile && (
                  <>
                    <td className="th-right">{p.adp}</td>
                    <td className="th-right">{p.pred}</td>
                    <td className="th-right">{p.experts}</td>
                    <td className="th-right">{p.madden}</td>
                    <td className="remove-player-td">
                      <button
                        className="remove-player-x"
                        onClick={() => this.props.removePlayer(p)}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /**
   * update the allowable positions in state, used to filter out players by position
   */
  private setPositionFilter = (position: Position) => {
    let { positionsToShow } = this.state;

    // if it's ?, clear anything else
    if (position === "?") {
      this.setState({ positionsToShow: ["?"] });
    } else if (positionsToShow.indexOf(position) > -1) {
      positionsToShow = positionsToShow.filter(p => p !== position);
      this.setState({
        positionsToShow: positionsToShow.length ? positionsToShow : ["?"]
      });
    } else {
      positionsToShow = positionsToShow.filter(p => p !== "?");
      this.setState({
        positionsToShow: positionsToShow.concat([position])
      });
    }
  };
}

const mapStateToProps = (state: IStoreState) => {
  const { QB, RBs, WRs, TE, Flex, DST, K } = state.teams[state.trackedTeam];

  // add the positions to the object that the trackedTeam hasn't
  // filled their roster with (ie they have space for)
  const valuedPositions = {} as any;
  if (!QB) {
    valuedPositions.QB = true;
  }
  if (!RBs.every((r: IPlayer) => !!r)) {
    valuedPositions.RB = true;
  }
  if (!WRs.every((w: IPlayer) => !!w)) {
    valuedPositions.WR = true;
  }
  if (!Flex) {
    valuedPositions.RB = true;
    valuedPositions.WR = true;
  }
  if (!TE) {
    valuedPositions.TE = true;
  }

  // after one of each main starter has been drafted, everything is valued
  if (!Object.keys(valuedPositions).length) {
    ["QB", "RB", "WR", "TE"].forEach(p => (valuedPositions[p] = true));
  }

  // only want one of each K and DST, none on bench
  if (!K) {
    valuedPositions.K = true;
  }
  if (!DST) {
    valuedPositions.DST = true;
  }

  // find the bye weeks already taken by the core players (QB, RB, WR, FLEX)
  const byeWeeks = [QB, ...RBs, ...WRs, Flex]
    .map(p => p && p.bye)
    .reduce((acc, bye) => (bye ? { ...acc, [bye]: true } : acc), {});

  return {
    byeWeeks,
    currentPick: state.currentPick,
    undraftedPlayers: getPlayers(state),
    valuedPositions
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  pickPlayer: (player: IPlayer) => dispatch(pickPlayer(player)),
  removePlayer: (player: IPlayer) => dispatch(removePlayer(player)),
  selectPlayer: (player: IPlayer) => dispatch(selectPlayer(player)),
  skip: () => dispatch(incrementDraft()),
  undo: () => dispatch(undoPlayerPick())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerTable);
