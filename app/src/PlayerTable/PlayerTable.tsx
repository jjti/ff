import * as React from "react";
import { connect } from "react-redux";

import { IPlayer } from "../Player";
import { undoPlayerPick } from "../store/actions/players";
import { pickPlayer } from "../store/actions/teams";
import { getPlayers } from "../store/reducers/players";
import { IStoreState } from "../store/store";

import "./PlayerTable.css";

interface IProps {
  undraftedPlayers: any;
  pickPlayer: any;
  undo: () => void;
  valuedPositions: any;
}

class PlayerTable extends React.Component<IProps> {
  public render() {
    return (
      <div>
        <header className="PlayerTable-Header">
          <h3>PLAYERS</h3>
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
              <th className="th-right">Draft</th>
            </tr>
          </thead>
          <tbody>
            {this.props.undraftedPlayers.map((p: IPlayer) => (
              <tr
                key={p.name + p.pos + p.team}
                onDoubleClick={() => this.props.pickPlayer(p)}
                className={
                  this.props.valuedPositions[p.pos]
                    ? "PlayerTable-Row PlayerTable-Row-Inactive"
                    : "PlayerTable-Row"
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
                <td className="draft-button-td">
                  <button
                    className="draft-button"
                    onClick={() => this.props.pickPlayer(p)}
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

  console.log(trackedTeam);

  if (!trackedTeam.QB) {
    valuedPositions.QB = true;
  } else if (!trackedTeam.TE) {
    valuedPositions.TE = true;
  } else if (!trackedTeam.RBs.every((r: IPlayer) => !!r)) {
    valuedPositions.RB = true;
  } else if (!trackedTeam.WRs.every((w: IPlayer) => !!w)) {
    valuedPositions.WR = true;
  }

  return {
    undraftedPlayers: getPlayers(state),
    valuedPositions
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  pickPlayer: (player: IPlayer) => dispatch(pickPlayer(player)),
  undo: () => dispatch(undoPlayerPick())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerTable);
