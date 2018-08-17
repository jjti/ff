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
  undraftedPlayers: any[];
  pickPlayer: (player: IPlayer) => void;
  removePlayer: (player: IPlayer) => void;
  selectPlayer: (player: IPlayer) => void;
  skip: () => void;
  undo: () => void;
  valuedPositions: object;
}

/**
 * A table displaying all the undrafted players
 *
 * Includes buttons for skipping the current round, without a pick,
 * and undoing the last round/pick (in the event of a mistake)
 */
class PlayerTable extends React.Component<IProps> {
  public render() {
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

        <table>
          <thead className="table-head">
            <tr>
              <th className="th-left">Name</th>
              <th className="th-left">Position</th>
              <th className="th-left">Team</th>
              <th className="th-right">VOR</th>
              <th className="th-right">ADP</th>
              <th className="th-right">Prediction</th>
              <th className="th-right">Experts</th>
              <th className="th-right">Madden</th>
              <th className="th-right">Remove</th>
            </tr>
          </thead>
          <tbody>
            {this.props.undraftedPlayers.map((p: IPlayer) => (
              <tr
                key={p.name + p.pos + p.team}
                onDoubleClick={() => this.props.pickPlayer(p)}
                className={
                  this.props.valuedPositions[p.pos]
                    ? "PlayerTable-Row"
                    : "PlayerTable-Row PlayerTable-Row-Inactive"
                }
              >
                <td>{p.name}</td>
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
  const trackedTeam = state.teams[state.trackedTeam];
  const valuedPositions = {} as any;

  // add the positions to the object that the trackedTeam hasn't
  // filled their roster with (ie they have space for)
  if (!trackedTeam.QB) {
    valuedPositions.QB = true;
  }
  if (!trackedTeam.TE) {
    valuedPositions.TE = true;
  }
  if (!trackedTeam.RBs.every((r: IPlayer) => !!r)) {
    valuedPositions.RB = true;
  }
  if (!trackedTeam.WRs.every((w: IPlayer) => !!w)) {
    valuedPositions.WR = true;
  }
  if (!trackedTeam.Flex) {
    valuedPositions.RB = true;
    valuedPositions.WR = true;
  }

  return {
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
