import * as React from "react";
import { connect } from "react-redux";

import { IPlayer } from "../Player";
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
  undraftedPlayers: any[];
  pickPlayer: (player: IPlayer) => void;
  removePlayer: (player: IPlayer) => void;
  selectPlayer: (player: IPlayer) => void;
  skip: () => void;
  undo: () => void;
  valuedPositions: { [key: string]: boolean };
}

/**
 * A table displaying all the undrafted players
 *
 * Includes buttons for skipping the current round, without a pick,
 * and undoing the last round/pick (in the event of a mistake)
 */
class PlayerTable extends React.Component<IProps> {
  public render() {
    const draftSoon = this.props.undraftedPlayers.map(
      p => p.adp && this.props.currentPick + 10 > p.adp
    );

    return (
      <div>
        <header className="PlayerTable-Header">
          <h3>PLAYERS</h3>
          <button className="skip-button" onClick={this.props.skip}>
            Skip
          </button>
          <button className="undo-button" onClick={this.props.undo}>
            Undo
          </button>
        </header>

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
              <th className="th-right" data-tip="value over replacement">
                VOR
              </th>
              <th className="th-right" data-tip="average draft position (ESPN)">
                ADP
              </th>
              <th
                className="th-right"
                data-tip="predicted number of regular season points"
              >
                Prediction
              </th>
              <th
                className="th-right"
                data-tip="average of expert predictions (ESPN, FOX, CBS, NFL)"
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
            </tr>
          </thead>
          <tbody>
            {this.props.undraftedPlayers.map((p: IPlayer, i) => (
              <tr
                key={p.name + p.pos + p.team}
                onDoubleClick={() => this.props.pickPlayer(p)}
                className={
                  this.props.valuedPositions[p.pos]
                    ? "PlayerTable-Row"
                    : "PlayerTable-Row PlayerTable-Row-Inactive"
                }
              >
                <td className="PlayerTable-Row-Name">
                  <p>{p.name} </p>
                  {draftSoon[i] ? <div className="dot green-dot" /> : null}{" "}
                  {this.props.byeWeeks[p.bye] ? (
                    <div className="dot orange-dot" />
                  ) : null}
                </td>
                <td>{p.pos}</td>
                <td>{p.team}</td>
                <td className="th-right">{p.vor}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
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
  if (!valuedPositions.length) {
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
