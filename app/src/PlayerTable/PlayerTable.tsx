import { Input } from 'antd';
import * as React from 'react';
import { IPlayer, Position } from '../models/Player';
import PlayerRow from './PlayerRow';
import './PlayerTable.css';

/** All possible positions. ? Means any position, don't filter */
const filterPositions: Position[] = ['?', 'QB', 'RB', 'WR', 'TE', 'DST', 'K'];

interface ITablePlayer extends IPlayer {
  /** ex: A. Rodgers */
  tableName: string;
}

interface IPlayerTableProps {
  byeWeeks: { [key: number]: boolean };
  draftSoon: boolean[];
  filteredPlayers: boolean[];
  mobile: boolean;
  nameFilter: string;
  pickPlayer: (player: IPlayer) => void;
  players: ITablePlayer[];
  positionsToShow: Position[];
  rbHandcuffs: IPlayer[];
  recommended: IPlayer[]; // names that are recommended
  removePlayer: (player: IPlayer) => void;
  setNameFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPositionFilter: (pos: Position) => void;
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
  byeWeeks,
  draftSoon,
  filteredPlayers,
  nameFilter,
  mobile,
  pickPlayer,
  players,
  positionsToShow,
  rbHandcuffs,
  recommended,
  removePlayer,
  setNameFilter,
  setPositionFilter,
  skip,
  valuedPositions,
  undo
}: IPlayerTableProps) => (
  <div className="PlayerTable Section">
    <div id="table-top-header" className="Stick-Section">
      <header>
        {!mobile && <h3>Players</h3>}

        {/* Name filter input element */}
        {!mobile && (
          <Input.Search
            className="Player-Search"
            placeholder="Name"
            onChange={setNameFilter}
            value={nameFilter}
          />
        )}

        {/* Buttons for filtering on position */}
        <div className="PlayerTable-Position-Buttons">
          {filterPositions.map(p => (
            <button
              key={p}
              className={positionsToShow.indexOf(p) > -1 ? 'Active' : ''}
              onClick={() => setPositionFilter(p)}>
              {p === '?' ? 'All' : p}
            </button>
          ))}
        </div>

        {/* Buttons for skipping and undoing actions */}
        <div className="Player-Table-Control-Buttons">
          {!mobile && (
            <button className="Grayed skip-button" onClick={skip}>
              Skip
            </button>
          )}

          <button className="Grayed undo-button" onClick={undo}>
            Undo
          </button>
        </div>
      </header>

      {/* Legend for dots on the row */}
      <div className="Legend-Row">
        {!mobile && (
          <>
            <div className="dot blue-dot" />
            <p className="small">Recommended</p>
          </>
        )}
        <div className="dot green-dot" />
        <p className="small">Will be drafted soon</p>
        {!mobile && (
          <>
            <div className="dot orange-dot" />
            <p className="small">BYE week conflict with starter</p>
            <div className="dot red-dot" />
            <p className="small">RB handcuff</p>
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
          Value
        </p>
        <p
          className="col col-prediction"
          data-tip="Experts' consensus projection">
          Projection
        </p>

        {/* Table headers not rendered on mobile */}
        {!mobile && (
          <>
            <p className="col col-adp" data-tip="Average draft position">
              ADP
            </p>
            <p className="col col-remove">Remove</p>
          </>
        )}
      </div>
    </div>

    <div id="table">
      <div id="table-body">
        {players
          .filter((_, i) => !filteredPlayers[i])
          .map((player: ITablePlayer, i) => (
            <PlayerRow
              key={player.key}
              mobile={mobile}
              pickPlayer={pickPlayer}
              draftSoon={draftSoon[i]}
              byeWeekConflict={byeWeeks[player.bye]}
              inValuablePosition={valuedPositions[player.pos]}
              player={player}
              rbHandcuff={rbHandcuffs.indexOf(player) > -1}
              recommended={recommended.indexOf(player) > -1}
              removePlayer={removePlayer}
            />
          ))}
      </div>
    </div>
  </div>
);
