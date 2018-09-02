import * as React from 'react';
import { DropTarget, DropTargetMonitor, DropTargetSpec } from 'react-dnd';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { DRAG_TYPES } from '../models/DragTypes';
import { IPlayer } from '../models/Player';
import { IPick } from '../models/Team';
import { removePlayer } from '../store/actions/players';
import { setPick } from '../store/actions/teams';
import './Card.css';

interface ICardProps {
  connectDropTarget?: any;
  length: number;
  pick: IPick;
  removePlayer: (player: IPlayer) => void;
  undoPick: (pick: IPick) => void;
  setPick: (pick: IPick) => void;
}

/**
 * Displays a single player card, either as a pick or as a player on a roster
 */
class Card extends React.Component<ICardProps> {
  public render() {
    const { connectDropTarget, length, pick, undoPick } = this.props;

    return connectDropTarget(
      <div
        key={pick.pickNumber}
        className={`Card ${pick.player ? '' : 'Card-Empty'}`}
        style={{ width: length, height: length }}>
        <h5>{pick.team + 1}</h5>

        {pick.player && (
          <button className="Undo-Player-Pick" onClick={() => undoPick(pick)} />
        )}

        <p className="small">
          {pick.player && pick.player.tableName ? pick.player.tableName : ''}
        </p>

        <p className="points small">Pick {pick.pickNumber + 1}</p>
      </div>
    );
  }
}

/**
 * behavior for dropping player rows on pick history cards
 */
const cardTarget: DropTargetSpec<ICardProps> = {
  /** Can only drop a player row on a card if it doesn't have a player */
  canDrop: (props: ICardProps) => !props.pick.player,

  /**
   * Update this 'Pick' in the store w/ dropped player
   * Remove that player from the list of undrafted players
   */
  drop: (
    {
      pick,
      removePlayer: removePlayerStore,
      setPick: setPickInStore
    }: ICardProps,
    monitor: DropTargetMonitor
  ) => {
    const player = monitor.getItem();
    setPickInStore({ ...pick, player });
    removePlayerStore(player);
  }
};

/** nothing */
const mapStateToProps = () => ({});

/** only add ability to update a pick with a player */
const mapDispatchToProps = (dispatch: Dispatch) => ({
  removePlayer: (player: IPlayer) => dispatch(removePlayer(player)),
  setPick: (pick: IPick) => dispatch(setPick(pick))
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  DropTarget(DRAG_TYPES.PLAYER_ROW, cardTarget, (dragConnect, monitor) => ({
    connectDropTarget: dragConnect.dropTarget(),
    isOver: monitor.isOver()
  }))
)(Card);
