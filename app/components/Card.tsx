import * as React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { IPlayer } from '../lib/models/Player';
import { IPick } from '../lib/models/Team';
import { removePlayer } from '../lib/store/actions/players';
import { pickPlayer, setPick, undoPick } from '../lib/store/actions/teams';
import { IStoreState } from '../lib/store/store';

interface ICardProps {
  canDrag: boolean;
  connectDragSource?: any;
  connectDropTarget?: any;
  currentPick?: boolean;
  isOver: boolean;
  length: number;
  numberOfTeams: number;
  pick: IPick;
  pickPlayer: (player: IPlayer) => void;
  playerMeta?: boolean;
  pos?: string;
  removePlayer: (player: IPlayer) => void;
  setPick: (pick: IPick) => void;
  trackedTeamPicking?: boolean;
  undoPick: (pick: IPick) => void;
}

/**
 * Displays a single player card, either as a pick or as a player on a roster
 */
class Card extends React.Component<ICardProps> {
  public render() {
    const {
      canDrag,
      currentPick,
      isOver,
      length,
      numberOfTeams,
      pick,
      playerMeta,
      pos,
      trackedTeamPicking,
      undoPick: undoPickInStore,
    } = this.props;

    const playerCard = playerMeta && pos;
    const pickNumber = pick.pickNumber || 0;
    const pickMessage = !playerMeta ? `${Math.floor(pickNumber / numberOfTeams) + 1}.${pickNumber + 1}` : '';

    const cardClass = [
      'Card',
      !pick.player && 'Card-Empty',
      isOver && 'Card-Hover',
      canDrag && 'Card-Draggable',
      trackedTeamPicking && 'Card-Active',
    ]
      .filter((c) => c)
      .join(' ');

    return (
      <div key={pick.pickNumber} className={cardClass} style={{ width: length, height: length }}>
        {playerCard ? (
          // @ts-ignore
          <h5>{pos}</h5>
        ) : (
          <h5>{pick.team + 1}</h5>
        )}
        {pick.player && !playerCard && <button className="Undo-Player-Pick" onClick={() => undoPickInStore(pick)} />}

        {pick.player && pick.player.tableName && (
          <p className="small">
            {pick.player.tableName}
            <br />
            {pickMessage}
          </p>
        )}

        {!playerCard && currentPick && <p className="small">Drafting</p>}
        {playerCard && pick.player && <p className="points small">{pick.player.vor}</p>}
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
  undoPick: (pick: IPick) => dispatch(undoPick(pick)),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(Card);
