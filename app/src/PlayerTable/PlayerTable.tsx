import * as React from "react";

// import { Column, Table } from "react-virtualized";
import { IPlayer } from "../Player";
import "./PlayerTable.css";

// const ROW_HEIGHT = 25;

interface IProps {
  playerData: IPlayer[];
}

export default class PlayerTable extends React.Component<IProps> {
  public render() {
    return (
      <div>
        <header className="PlayerTable-Header">
          <h3>PLAYERS</h3>
          <button className="undo-button">Undo</button>
        </header>

        <table>
          <thead>
            <th className="th-left">Name</th>
            <th className="th-left">Position</th>
            <th className="th-left">Team</th>
            <th className="th-right">VOR</th>
            <th className="th-right">ADP</th>
            <th className="th-right">Prediction</th>
            <th className="th-right">Experts</th>
            <th className="th-right">Madden</th>
            <th className="th-right">Draft</th>
          </thead>
          <tbody>
            {this.props.playerData.map(p => (
              <tr>
                <td>{p.name}</td>
                <td>{p.pos}</td>
                <td>{p.team}</td>
                <td className="th-right">{p.vor}</td>
                <td className="th-right">{p.adp}</td>
                <td className="th-right">{p.pred}</td>
                <td className="th-right">{p.experts}</td>
                <td className="th-right">{p.madden}</td>
                <td className="draft-button-td">
                  <button className="draft-button" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // private rowGetter({ index }: { index: number }) {
  //   return this.props.playerData[index];
  // }
}
