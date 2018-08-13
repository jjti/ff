import * as React from "react";

import { IPlayer, Position } from "../Player";

interface IProps {
  player: IPlayer | null | undefined;
  pos: Position;
  length: number;
}

export default class PlayerCard extends React.Component<IProps> {
  public render() {
    const { player, pos, length } = this.props;

    const style = { height: length, width: length };

    // player isn't defined yet for this position, give empty position instead
    if (!player) {
      return (
        <div className="Card Card-Empty" style={style}>
          <h5>{pos}</h5>
        </div>
      );
    }

    // just first initial and last name, full team name for DST
    const playerName =
      pos === "DST"
        ? player.name
        : player.name
            .split(" ")
            .map((n, i) => (i ? n : n.charAt(0)))
            .join(". ");

    return (
      <div className="Card" style={style}>
        <h5>{player.pos}</h5>
        <p className="small">{playerName}</p>
        <p className="points small">{player.vor}</p>
      </div>
    );
  }
}
