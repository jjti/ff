import * as React from "react";
import { connect } from "react-redux";

import { IPlayer } from "../Player";
import { undoPlayerPick } from "../store/actions/players";
import { pickPlayer } from "../store/actions/teams";
import { getPlayers } from "../store/reducers/players";
import { StoreState } from "../store/store";
import "./PlayerTable.css";

// const ROW_HEIGHT = 25;

interface IProps {
  undraftedPlayers: any;
  pickPlayer: any;
  undo: () => void;
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
                className="PlayerTable-Row"
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

const mapStateToProps = (state: StoreState) => ({
  undraftedPlayers: getPlayers(state)
});

const mapDispatchToProps = (dispatch: any) => ({
  pickPlayer: (player: IPlayer) => dispatch(pickPlayer(player)),
  undo: () => dispatch(undoPlayerPick())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerTable);
