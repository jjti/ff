import * as React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { IPlayer, Position } from '../models/Player';
import { IPick } from '../models/Team';
import { removePlayer } from '../store/actions/players';
import { pickPlayer, setPick, undoPick } from '../store/actions/teams';
import { IStoreState } from '../store/store';
import './Card.css';

interface ICardProps {
  canDrag: boolean;
  connectDragSource?: any;
  connectDropTarget?: any;
  currentPick?: boolean;
  length: number;
  pick: IPick;
  isOver: boolean;
  numberOfTeams: number;
  pickPlayer: (player: IPlayer) => void;
  playerMeta?: boolean;
  pos?: Position;
  removePlayer: (player: IPlayer) => void;
  trackedTeamPicking?: boolean;
  undoPick: (pick: IPick) => void;
  setPick: (pick: IPick) => void;
}

/**
 * Displays a single player card, either as a pick or as a player on a roster
 */
class Card extends React.Component<ICardProps> {
  public render() {
    const {
      canDrag,
      currentPick,
      length,
      isOver,
      numberOfTeams,
      pick,
      playerMeta,
      pos,
      trackedTeamPicking,
      undoPick: undoPickInStore
    } = this.props;

    const playerCard = playerMeta && pos;

    const pickMessage = !playerMeta
      ? `${Math.floor(pick.pickNumber / numberOfTeams) + 1}.${pick.pickNumber +
          1}`
      : '';

    const cardClass = [
      'Card',
      !pick.player && 'Card-Empty',
      isOver && 'Card-Hover',
      canDrag && 'Card-Draggable',
      trackedTeamPicking && 'Card-Active'
    ]
      .filter(c => c)
      .join(' ');

    return (
      <div
        key={pick.pickNumber}
        className={cardClass}
        style={{ width: length, height: length }}>
        {playerCard ? (
          // @ts-ignore
          <h5>{pos}</h5>
        ) : (
          <h5>{pick.team + 1}</h5>
        )}
        {pick.player && !playerCard && (
          <button
            className="Undo-Player-Pick"
            onClick={() => undoPickInStore(pick)}
          />
        )}

        {pick.player && pick.player.tableName && (
          <p className="small">
            {pick.player.tableName}
            <br />
            {pickMessage}
          </p>
        )}

        {!playerCard && currentPick && <p className="small">Drafting</p>}
        {playerCard && pick.player && (
          <p className="points small">{pick.player.vor}</p>
        )}
      </div>
    );
  }
}

/** nothing */
const mapStateToProps = ({ numberOfTeams }: IStoreState) => ({ numberOfTeams });

/** only add ability to update a pick with a player */
const mapDispatchToProps = (dispatch: Dispatch) => ({
  pickPlayer: (player: IPlayer) => dispatch(pickPlayer(player)),
  removePlayer: (player: IPlayer) => dispatch(removePlayer(player)),
  setPick: (pick: IPick) => dispatch(setPick(pick)),
  undoPick: (pick: IPick) => dispatch(undoPick(pick))
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Card);
