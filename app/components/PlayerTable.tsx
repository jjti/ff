import { Input, InputRef, Tooltip } from 'antd';
import * as React from 'react';
import { IPlayer, Position } from '../lib/models/Player';
import PlayerTableRow from './PlayerTableRow';

/** All possible positions. ? Means any position, don't filter */
const filterPositions: Position[] = ['?', 'QB', 'RB', 'WR', 'TE', 'DST', 'K'];

interface ITablePlayer extends IPlayer {
  /** eg: A. Rodgers */
  tableName: string;
}

interface IPlayerTableProps {
  adpCol: string;
  byeWeeks: { [key: number]: boolean };
  currentPick: number;
  draftSoon: boolean[];
  filteredPlayers: boolean[];
  mobile: boolean;
  nameFilter: string;
  onPickPlayer: (player: IPlayer) => void;
  players: ITablePlayer[];
  positionsToShow: Position[];
  rbHandcuffs: Set<IPlayer>;
  recommended: Set<IPlayer>; // names that are recommended
  resetPositionFilter: () => void; // reset positions
  onRemovePlayer: (player: IPlayer) => void;
  setNameFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
  togglePositionFilter: (pos: Position) => void;
  skip: () => void;
  undo: () => void;
  valuedPositions: { [key: string]: boolean };
}

/**
 * Player table, central part of the app. Clicking on a row with "pick"
 * that player, drafting them to the selected team and clearing them from the table
 *
 * Also showing information that's useful for drafting, like whether the player
 * is in a "valuable position" (unfilled starting position), has a bye week conflict
 * with another starter (will both sit that week), or is a handcuff to another RB
 */
export default ({
  adpCol,
  byeWeeks,
  draftSoon,
  filteredPlayers,
  nameFilter,
  mobile,
  onPickPlayer,
  players,
  positionsToShow,
  rbHandcuffs,
  recommended,
  onRemovePlayer,
  resetPositionFilter,
  setNameFilter,
  togglePositionFilter,
  skip,
  valuedPositions,
  undo,
}: IPlayerTableProps) => {
  const inputRef = React.createRef<InputRef>();

  return (
    <div className="PlayerTable Section">
      <div id="table-top-header" className="Stick-Section">
        <header>
          {!mobile && <h3>Players</h3>}

          {/* Name filter input element */}
          {!mobile && (
            <Input.Search
              autoFocus
              className="Player-Search"
              placeholder="Name"
              onChange={setNameFilter}
              value={nameFilter}
              ref={inputRef}
            />
          )}

          {/* Buttons for filtering on position */}
          <div className="PlayerTable-Position-Buttons">
            {filterPositions.map((p) => (
              <button
                key={p}
                className={positionsToShow.indexOf(p) > -1 ? 'Active' : ''}
                onClick={() => togglePositionFilter(p)}>
                {p === '?' ? 'All' : p}
              </button>
            ))}
          </div>

          {/* Buttons for skipping and undoing actions */}
          {!mobile && (
            <div className="Player-Table-Control-Buttons">
              <button className="Grayed skip-button" onClick={skip}>
                Skip
              </button>

              <button className="Grayed undo-button" onClick={undo}>
                Undo
              </button>
            </div>
          )}
        </header>

        {/* Legend for dots on the row */}
        <div className="Legend-Row">
          {!mobile && (
            <>
              <div className="dot green-dot" />
              <p className="small">Recommended</p>
              <div className="dot blue-dot" />
              <p className="small">RB handcuff</p>
              <div className="dot orange-dot" />
              <p className="small">Will be drafted soon</p>
              <div className="dot red-dot" />
              <p className="small">BYE week overlap</p>
            </>
          )}
        </div>
        <div id="table-head">
          <div className="col col-name">
            <p>Name</p>
          </div>
          <p className="col col-pos">Position</p>
          <p className="col col-team">Team</p>
          <p className="col col-vor" data-tip="Value over replacement">
            <Tooltip title="Value over replacement">
              <span>Value</span>
            </Tooltip>
          </p>
          <p className="col col-prediction">
            <Tooltip title="Experts' consensus projection">
              <span>{!mobile ? 'Projection' : 'Points'}</span>
            </Tooltip>
          </p>

          {/* Table headers not rendered on mobile */}
          {!mobile && (
            <>
              <p className="col col-adp">
                <Tooltip title="Average draft position">
                  <span>ADP</span>
                </Tooltip>
              </p>
              <p className="col col-remove" style={{ paddingRight: 12 }}>
                Remove
              </p>
            </>
          )}
        </div>
      </div>

      <div id="table">
        <div id="table-body">
          {players
            .filter((_, i) => !filteredPlayers[i])
            .map((player: ITablePlayer, i) => (
              <PlayerTableRow
                key={player.key}
                adpCol={adpCol}
                mobile={mobile}
                onPickPlayer={(p: IPlayer) => {
                  onPickPlayer(p);
                  resetPositionFilter();
                  inputRef.current?.focus();
                }}
                draftSoon={draftSoon[i]}
                byeWeekConflict={byeWeeks[player.bye]}
                inValuablePosition={valuedPositions[player.pos]}
                player={player}
                rbHandcuff={rbHandcuffs.has(player)}
                recommended={recommended.has(player)}
                onRemovePlayer={(p: IPlayer) => {
                  onRemovePlayer(p);
                  resetPositionFilter();
                  inputRef.current?.focus();
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
