import { DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';

import { IPlayer } from '../lib/models/Player';

interface IPlayerRowProps {
  adpCol: string;
  byeWeekConflict: boolean;
  connectDragPreview?: any;
  connectDragSource?: any;
  draftSoon: boolean;
  inValuablePosition: boolean;
  mobile: boolean;
  onPickPlayer: (player: IPlayer) => void;
  player: IPlayer;
  rbHandcuff: boolean;
  recommended: boolean;
  onRemovePlayer: (player: IPlayer) => void;
}

/**
 * A single player row in the PlayerTable.
 *
 * Shows their name, team, VOR, projection
 */
export default class PlayerTableRow extends React.Component<IPlayerRowProps> {
  public render() {
    const {
      adpCol,
      byeWeekConflict,
      draftSoon,
      inValuablePosition,
      mobile,
      onPickPlayer,
      player,
      rbHandcuff,
      recommended,
      onRemovePlayer,
    } = this.props;

    return (
      <div onClick={() => onPickPlayer(player)} className={inValuablePosition || mobile ? 'row' : 'row row-inactive'}>
        <div className="col col-name">
          <p>{player.tableName}</p>
          {/* Add dots for information on bye week */}
          {recommended && !mobile && <div className="dot green-dot" />}
          {rbHandcuff && !mobile && <div className="dot blue-dot" />}
          {draftSoon ? <div className="dot orange-dot" /> : null}{' '}
          {byeWeekConflict && !mobile && <div className="dot red-dot" />}
        </div>
        <p className="col col-pos">{player.pos}</p>
        <p className="col col-team">{player.team}</p>
        <p className="col col-vor">{player.vor}</p>
        <p className="col col-prediction">{player.forecast}</p>

        {/* Table data not rendered on mobile */}
        {!mobile && (
          <>
            {/* @ts-ignore */}
            <p className="col col-adp">{player[adpCol] && player[adpCol] > 0 ? player[adpCol] : ''}</p>
            <div className="col col-remove">
              <Button
                icon={<DeleteOutlined />}
                // shape="circle"
                size="small"
                type="text"
                className="remove-player-button"
                style={{ marginRight: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlayer(player);
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  }
}
