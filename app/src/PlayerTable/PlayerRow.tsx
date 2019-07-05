import * as React from 'react';
import { DragSource } from 'react-dnd';
import { DRAG_TYPES } from '../models/DragTypes';
import { IPlayer } from '../models/Player';
import './PlayerTable.css';

interface IPlayerRowProps {
  byeWeekConflict: boolean;
  connectDragPreview?: any;
  connectDragSource?: any;
  draftSoon: boolean;
  inValuablePosition: boolean;
  mobile: boolean;
  pickPlayer: (player: IPlayer) => void;
  player: IPlayer;
  rbHandcuff: boolean;
  recommended: boolean;
  removePlayer: (player: IPlayer) => void;
}

/**
 * A single player row in the PlayerTable.
 * Shows their name, team, VOR, etc
 * Should be draggable into the pick row
 */
class PlayerRow extends React.Component<IPlayerRowProps> {
  public render() {
    const {
      byeWeekConflict,
      connectDragPreview,
      connectDragSource,
      draftSoon,
      inValuablePosition,
      mobile,
      pickPlayer,
      player,
      rbHandcuff,
      recommended,
      removePlayer
    } = this.props;

    return connectDragSource(
      <div
        onClick={() => pickPlayer(player)}
        className={inValuablePosition || mobile ? 'row' : 'row row-inactive'}>
        {connectDragPreview(
          <div className="col col-name">
            <p>{player.tableName}</p>
            {/* Add dots for information on bye week */}
            {recommended && !mobile && <div className="dot blue-dot" />}
            {draftSoon ? <div className="dot green-dot" /> : null}{' '}
            {byeWeekConflict && !mobile && <div className="dot orange-dot" />}
            {rbHandcuff && !mobile && <div className="dot red-dot" />}
          </div>
        )}
        <p className="col col-pos">{player.pos}</p>
        <p className="col col-team">{player.team}</p>
        <p className="col col-vor">{player.vor}</p>
        <p className="col col-prediction">{player.forecast}</p>

        {/* Table data not rendered on mobile */}
        {!mobile && (
          <>
            <p className="col col-adp">{player.adp}</p>
            <button
              className="remove-player-x col col-remove"
              onClick={e => {
                e.stopPropagation();
                removePlayer(player);
              }}
            />
          </>
        )}
      </div>
    );
  }
}

// see: http://react-dnd.github.io/react-dnd/docs-drag-source.html
const playerRowSource = {
  beginDrag: (props: IPlayerRowProps): IPlayer => {
    return props.player;
  }
};

export default DragSource(
  DRAG_TYPES.PLAYER_ROW,
  playerRowSource,
  (dragConnect, monitor) => ({
    connectDragPreview: dragConnect.dragPreview(),
    connectDragSource: dragConnect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(PlayerRow);
