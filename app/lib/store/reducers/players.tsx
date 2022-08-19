import { toast } from 'react-toastify';
import { DraftablePositions as positions, IPlayer } from '../../models/Player';
import { IScoring } from '../../models/Scoring';
import { IPick, IRoster, ITeam, NullablePlayer } from '../../models/Team';
import { createTeam, IStoreState } from '../store';
import { setActiveTeam } from './teams';

export let INITIAL_PLAYERS: IPlayer[];

interface IPlayerForecast extends IPlayer {
  forecast: number;
}

/**
 * Update the list of players in the store. Set tableName on them
 */
export const setPlayers = (state: IStoreState, players: IPlayer[]): IStoreState => {
  // tableName returns an abbreviated player name that fits in the cards and rows
  const tableName = (name: string) => `${name[0]}. ${name.split(' ')[1]}`;

  const positions = new Set(['QB', 'RB', 'WR', 'TE', 'DST', 'K']);
  let playersWithTableName = players
    .map((p) => ({
      ...p,
      tableName: p.pos === 'DST' ? p.name : tableName(p.name),
    }))
    .filter((p) => positions.has(p.pos)); // TODO: filter "P" players on server

  // chopping off bottom for rendering perf
  playersWithTableName = playersWithTableName;

  // hacky but am storing players here for a reset event
  if (!INITIAL_PLAYERS) {
    INITIAL_PLAYERS = playersWithTableName;
  }

  return updatePlayerVORs({
    ...state,
    pastPicks: [],
    players: playersWithTableName,
    undraftedPlayers: playersWithTableName,
  });
};

/**
 * Remove the player from the store and the players array
 * Update the past history
 *
 * Past picks doesn't change
 */
export const removePlayer = (state: IStoreState, player: IPlayer): IStoreState => ({
  ...state,
  undraftedPlayers: state.undraftedPlayers.filter((p) => p.key !== player.key),
});

/**
 * given a player and a team's roster, remove the player from the roster
 */
const removeFromRoster = (roster: ITeam, player: IPlayer): ITeam => {
  // @ts-ignore
  return Object.keys(roster).reduce(
    (acc: ITeam, pos) => ({
      ...acc,
      [pos]: roster[pos].reduce(
        (players: NullablePlayer[], p: NullablePlayer) => (p === player ? [...players, null] : [...players, p]),
        []
      ),
    }),
    {}
  ) as ITeam;
};

/**
 * Undo the last pick/skip action
 * Unlike undoPick, this isn't player specific
 */
export const undoLast = (state: IStoreState): IStoreState => {
  const { currentPick, pastPicks } = state;
  let { teams, undraftedPlayers } = state;

  if (!pastPicks.length) {
    // cannot do anything on the zero-th pick
    return state;
  }

  // check and adjust for the last team pick
  const lastPick = pastPicks[0];
  if (lastPick.player) {
    teams = [
      ...teams.slice(0, lastPick.team),
      removeFromRoster(teams[lastPick.team], lastPick.player),
      ...teams.slice(lastPick.team + 1),
    ];

    undraftedPlayers = [lastPick.player, ...undraftedPlayers].sort(
      // @ts-ignore
      (a: IPlayer, b: IPlayer) => b.vor - a.vor
    );
  } else {
    toast.info('Undoing Skip');
  }

  return setActiveTeam({
    ...state,
    currentPick: currentPick - 1,
    pastPicks: pastPicks.slice(1),
    teams,
    undraftedPlayers,
  });
};

/**
 * Add the PlayerPick back into the list of teams and remove from the teams roster
 * If the pick paramter is null, undo the last pick
 */
export const undoPick = (state: IStoreState, pick: IPick): IStoreState => {
  const { pastPicks, undraftedPlayers } = state;
  let { teams } = state;

  if (!pick.player) {
    // should never happen
    return state;
  }

  teams = [
    ...teams.slice(0, pick.team),
    removeFromRoster(teams[pick.team], pick.player),
    ...teams.slice(pick.team + 1),
  ];

  return {
    ...state,
    pastPicks: pastPicks.reduce(
      (acc: IPick[], p: IPick) => (p === pick ? acc.concat({ ...p, player: null }) : acc.concat(p)),
      []
    ),
    teams,
    undraftedPlayers: [pick.player, ...undraftedPlayers].sort((a: IPlayer, b: IPlayer) =>
      a.vor !== undefined && b.vor !== undefined ? b.vor - a.vor : 0
    ),
  };
};

/**
 * Change the default roster format, changing number of QBs, RBs, etc
 * Will involve recalculating VORs
 */
export const setRosterFormat = (state: IStoreState, newRosterFormat: IRoster): IStoreState =>
  updatePlayerVORs({
    ...state,
    rosterFormat: newRosterFormat,
    teams: new Array(state.numberOfTeams).fill(null).map(() => createTeam(newRosterFormat)),
  });

/**
 * Update the VOR for all the players not yet drafted. Is dependent on
 * the number of teams currently in the draft
 */
export const updatePlayerVORs = (state: IStoreState): IStoreState => ({
  ...state,
  undraftedPlayers: updateVOR(state),
});

/**
 * Calculate the VOR of all the players.
 *
 * #1: find the number of players at each position
 * #2: find the replacement projection for each position (what's the projection for the next player off waivers?)
 * #3: calculate each player's VOR using their projection minus their replacement player's projection
 * #4: sort the players by their VOR
 */
const updateVOR = (state: IStoreState): IPlayer[] => {
  const { numberOfTeams, rosterFormat, scoring, players: playersNoForecast } = state;

  // get player array with estimated season-end projection
  const players = playersWithForecast(scoring, playersNoForecast);

  // #1 find replacement player index for each position
  //
  // total how many starters will be used across all teams
  const positionToReplacementIndex = positions.reduce((acc, pos) => {
    let starters = rosterFormat[pos];

    if (pos === 'QB') {
      starters += rosterFormat['SUPERFLEX'];
    }
    if (['RB', 'WR'].includes(pos)) {
      starters += 1; // I have no great excuse for this
      starters += rosterFormat['FLEX'];
    }
    if (['K', 'DST'].includes(pos)) {
      starters = 0;
    }

    return { [pos]: Math.round(starters * numberOfTeams + 1), ...acc };
  }, {});

  // #2 find replacement values at each position subtracting points at the N+1'th index at that position
  //
  // filter by position, sort descending by prediction points, and get the number of points by the replacement player
  // map positions to their replacement values
  const positionToReplacementValue = positions.reduce((acc, pos) => {
    // sort the players, in that position, by their VOR
    const sortedPlayersInPosition = players.filter((p) => p.pos === pos).sort((a, b) => b.forecast - a.forecast);

    // this is for an edge-case where there's a ton of teams or each roster is huge.
    let replacementValue = 0;
    if (positionToReplacementIndex[pos] < sortedPlayersInPosition.length) {
      replacementValue = sortedPlayersInPosition[positionToReplacementIndex[pos]].forecast;
    }

    return { [pos]: replacementValue, ...acc };
  }, {});

  return (
    players
      // #3 set players' VORs
      .map((p) => ({
        ...p,
        vor: p.forecast - positionToReplacementValue[p.pos],
      }))
      // #4 sort 'em
      .sort((a, b) => b.vor - a.vor || -1)
  );
};

/**
 * Update the players by forecasting their season-end points.
 *
 * Use league score and the league's point settings
 */
const playersWithForecast = (scoring: IScoring, players: IPlayer[]): IPlayerForecast[] => {
  return players.map((p) => ({
    ...p,
    forecast: Math.round(
      Object.keys(scoring).reduce(
        (acc, k) => (k === 'dfPointsAllowedPerGame' ? acc + 16.0 * dstPointsPerGame(p[k]) : acc + scoring[k] * p[k]),
        0.0
      )
    ),
  }));
};

/**
 * Estimate the points a team will earn from points against over season
 */
const dstPointsPerGame = (pts: number): number => {
  if (pts === null) {
    return 0;
  }
  if (pts < 1) {
    return 5;
  } else if (pts < 7) {
    return 4;
  } else if (pts < 14) {
    return 3;
  } else if (pts < 18) {
    return 1;
  } else if (pts < 28) {
    return 0;
  } else if (pts < 35) {
    return -1;
  } else if (pts < 46) {
    -3;
  }
  return -5;
};
